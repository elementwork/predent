import type { Context, Next } from "hono";

interface LimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

const store = new Map<string, LimitEntry>();

function getClientIp(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return (
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-real-ip") ??
    "unknown"
  );
}

function makeKey(c: Context, options: RateLimitOptions): string {
  const prefix = options.keyPrefix ?? "rl";
  const ip = getClientIp(c);
  const path = c.req.path;
  return `${prefix}:${ip}:${path}`;
}

export function rateLimit(options: RateLimitOptions) {
  return async (c: Context, next: Next) => {
    const now = Date.now();
    const key = makeKey(c, options);
    const entry = store.get(key);

    if (entry && entry.resetAt > now) {
      if (entry.count >= options.maxRequests) {
        return c.json(
          { error: "Too many requests. Please try again later." },
          429
        );
      }
      entry.count++;
    } else {
      store.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });
    }

    // Optional: clean up expired entries occasionally to prevent unbounded growth
    if (store.size > 10000 && Math.random() < 0.01) {
      for (const [k, v] of store) {
        if (v.resetAt <= now) {
          store.delete(k);
        }
      }
    }

    await next();
  };
}

export function clearRateLimitStore() {
  store.clear();
}
