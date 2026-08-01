import * as Sentry from "@sentry/node";
import type { Context, Next } from "hono";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    enabled:
      process.env.NODE_ENV === "production" || !!process.env.SENTRY_DSN,
  });
}

export function sentryMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (err) {
      if (err instanceof Error) {
        Sentry.captureException(err, {
          extra: {
            method: c.req.method,
            path: c.req.path,
            status: c.res.status,
          },
        });
      }
      throw err;
    }
  };
}

export { Sentry };
