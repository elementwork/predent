import type { Context, Next } from "hono";
import { env } from "./env";

interface LimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

interface RateLimitResult extends LimitEntry {
  source: "local" | "redis";
}

type RedisResponse = {
  result?: unknown;
  error?: string;
};

const store = new Map<string, LimitEntry>();
let warnedAboutLocalProductionStore = false;

const FIXED_WINDOW_SCRIPT = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return { count, ttl }
`;

function cleanIdentity(value: string | undefined): string | null {
  const identity = value?.split(",")[0]?.trim();
  if (!identity || identity.length > 128 || /[\r\n]/.test(identity)) {
    return null;
  }
  return identity;
}

export function getClientIp(c: Context): string {
  if (process.env.VERCEL) {
    return cleanIdentity(c.req.header("x-vercel-forwarded-for")) ?? "unknown";
  }

  if (env.trustCloudflareProxy) {
    return cleanIdentity(c.req.header("cf-connecting-ip")) ?? "unknown";
  }

  if (env.trustProxy) {
    return cleanIdentity(c.req.header("x-forwarded-for")) ?? "unknown";
  }

  const bindings = (c.env ?? {}) as {
    incoming?: { socket?: { remoteAddress?: string } };
  };
  return cleanIdentity(bindings.incoming?.socket?.remoteAddress) ?? "unknown";
}

function makeKey(c: Context, options: RateLimitOptions): string {
  const prefix = options.keyPrefix ?? "rl";
  return `predent:${prefix}:${getClientIp(c)}:${c.req.path}`;
}

function consumeLocal(
  key: string,
  options: RateLimitOptions,
  now: number
): RateLimitResult {
  const entry = store.get(key);
  if (entry && entry.resetAt > now) {
    entry.count++;
    return { ...entry, source: "local" };
  }

  const next = { count: 1, resetAt: now + options.windowMs };
  store.set(key, next);
  return { ...next, source: "local" };
}

async function consumeRedis(
  key: string,
  options: RateLimitOptions,
  now: number
): Promise<RateLimitResult> {
  const response = await fetch(env.upstashRedisRestUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.upstashRedisRestToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      "EVAL",
      FIXED_WINDOW_SCRIPT,
      "1",
      key,
      String(options.windowMs),
    ]),
    signal: AbortSignal.timeout(2_000),
  });

  const payload = (await response.json()) as RedisResponse;
  if (!response.ok || payload.error || !Array.isArray(payload.result)) {
    throw new Error(payload.error ?? `Redis returned HTTP ${response.status}`);
  }

  const count = Number(payload.result[0]);
  const ttl = Number(payload.result[1]);
  if (!Number.isFinite(count) || !Number.isFinite(ttl)) {
    throw new Error("Redis returned an invalid rate-limit response");
  }

  return {
    count,
    resetAt: now + Math.max(0, ttl),
    source: "redis",
  };
}

async function consume(
  key: string,
  options: RateLimitOptions,
  now: number
): Promise<RateLimitResult> {
  const hasRedis = Boolean(
    env.upstashRedisRestUrl && env.upstashRedisRestToken
  );
  if (hasRedis) {
    try {
      return await consumeRedis(key, options, now);
    } catch (error) {
      console.error(
        "[rate-limit] Redis store unavailable; falling back to local store:",
        error
      );
    }
  } else if (env.isProduction && !warnedAboutLocalProductionStore) {
    warnedAboutLocalProductionStore = true;
    console.warn(
      "[rate-limit] Redis rate limiting is not configured; using the local store. Limits are not shared across instances."
    );
  }
  return consumeLocal(key, options, now);
}

export function rateLimit(options: RateLimitOptions) {
  return async (c: Context, next: Next) => {
    const now = Date.now();
    let result: RateLimitResult;
    try {
      result = await consume(makeKey(c, options), options, now);
    } catch (error) {
      console.error("[rate-limit] Store unavailable:", error);
      return c.json(
        { error: "Request protection is temporarily unavailable." },
        503
      );
    }

    const remaining = Math.max(0, options.maxRequests - result.count);
    const resetSeconds = Math.max(0, Math.ceil((result.resetAt - now) / 1000));
    c.header("RateLimit-Limit", String(options.maxRequests));
    c.header("RateLimit-Remaining", String(remaining));
    c.header("RateLimit-Reset", String(resetSeconds));

    if (result.count > options.maxRequests) {
      c.header("Retry-After", String(resetSeconds));
      return c.json(
        { error: "Too many requests. Please try again later." },
        429
      );
    }

    await next();

    if (store.size > 10_000 && Math.random() < 0.01) {
      for (const [key, entry] of store) {
        if (entry.resetAt <= now) store.delete(key);
      }
    }
  };
}

export function clearRateLimitStore() {
  store.clear();
  warnedAboutLocalProductionStore = false;
}
