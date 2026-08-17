import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { getEffectiveTier, hasTierAccess, type Tier } from "@contracts/tiers";
import { incrementCounter, log, observeDuration } from "./lib/observability";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error, ctx }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        requestId: ctx?.requestId ?? null,
        validation:
          error.cause &&
          typeof error.cause === "object" &&
          "flatten" in error.cause
            ? (error.cause as { flatten: () => unknown }).flatten()
            : null,
      },
    };
  },
});

export const createRouter = t.router;

const instrumentProcedure = t.middleware(async ({ ctx, path, type, next }) => {
  const started = performance.now();
  incrementCounter("trpc_requests");
  const result = await next();
  const durationMs = Math.round((performance.now() - started) * 100) / 100;
  observeDuration(`trpc.${path}`, durationMs);
  const serverError =
    !result.ok && result.error.code === "INTERNAL_SERVER_ERROR";
  if (serverError) incrementCounter("trpc_errors");
  log(result.ok ? "info" : serverError ? "error" : "warn", "trpc.procedure", {
    requestId: ctx.requestId,
    procedure: path,
    type,
    ok: result.ok,
    durationMs,
    errorCode: result.ok ? undefined : result.error.code,
  });
  return result;
});

export const publicQuery = t.procedure.use(instrumentProcedure);

const requireAuth = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

function requireRole(role: string) {
  return t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

function requireTier(requiredTier: Tier) {
  return t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ErrorMessages.unauthenticated,
      });
    }

    const effectiveTier = getEffectiveTier(
      ctx.user.tier,
      ctx.user.premiumUntil
    );
    if (!hasTierAccess(effectiveTier, requiredTier)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Premium subscription required.",
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user, effectiveTier } });
  });
}

export const authedQuery = publicQuery.use(requireAuth);
export const adminQuery = authedQuery.use(requireRole("admin"));
export const premiumQuery = authedQuery.use(requireTier("premium"));
