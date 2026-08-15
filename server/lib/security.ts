import type { MiddlewareHandler } from "hono";
import { env } from "./env";
import { isTrustedRequestOrigin } from "./origin";

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'sha256-/fN7sZWQuibYlW1zVGQPG5vq7jmvrPdxt6wKyWQeoNM='",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.posthog.com https://*.posthogusercontent.com https://*.sentry.io",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

export function securityHeaders(): MiddlewareHandler {
  return async (c, next) => {
    try {
      await next();
    } finally {
      c.header("Content-Security-Policy", CONTENT_SECURITY_POLICY);
      c.header("Cross-Origin-Opener-Policy", "same-origin");
      c.header("Cross-Origin-Resource-Policy", "same-origin");
      c.header(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
      );
      c.header("Referrer-Policy", "strict-origin-when-cross-origin");
      c.header("X-Content-Type-Options", "nosniff");
      c.header("X-Frame-Options", "DENY");
      if (env.isProduction) {
        c.header(
          "Strict-Transport-Security",
          "max-age=31536000; includeSubDomains"
        );
      }
    }
  };
}

export function requireTrustedMutationOrigin(): MiddlewareHandler {
  return async (c, next) => {
    if (
      c.req.method !== "GET" &&
      c.req.method !== "HEAD" &&
      c.req.method !== "OPTIONS" &&
      !isTrustedRequestOrigin({
        origin: c.req.header("origin"),
        requestUrl: c.req.url,
      })
    ) {
      return c.json({ error: "Untrusted request origin" }, 403);
    }
    await next();
  };
}
