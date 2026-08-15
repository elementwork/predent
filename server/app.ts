import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import Stripe from "stripe";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import {
  createOAuthCallbackHandler,
  createOAuthAuthorizeHandler,
} from "./auth/auth";
import { Paths } from "@contracts/constants";
import { getDb } from "./queries/connection";
import { outboxJobs } from "@db/schema";
import { count, eq, min, or, sql } from "drizzle-orm";
import {
  notifyUpcomingTasks,
  sendStudyReminders,
} from "./lib/tasks/notifications";
import { rateLimit } from "./lib/rate-limit";
import { sentryMiddleware, traced } from "./lib/sentry";
import { drainOutbox } from "./lib/outbox/worker";
import {
  renderPrometheusMetrics,
  requestObservability,
} from "./lib/observability";
import { requireTrustedMutationOrigin, securityHeaders } from "./lib/security";
import { processStripeWebhookEvent } from "./services/stripe-webhook-service";
import { reconcileAllStripeEntitlements } from "./services/stripe-reconciliation-service";

const app = new Hono<{
  Bindings: HttpBindings;
  Variables: { requestId: string };
}>();

const stripeClient = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey)
  : null;

app.use(bodyLimit({ maxSize: 1 * 1024 * 1024 })); // 1MB — no file uploads needed
app.use("*", requestObservability());
app.use("*", securityHeaders());
app.use(sentryMiddleware());

app.get("/api/health/live", c =>
  c.json({ status: "ok", requestId: c.get("requestId") })
);

app.get("/api/health/ready", async c => {
  try {
    await Promise.race([
      traced("database.readiness", "db.query", () =>
        getDb().execute(sql`select 1`)
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database readiness timeout")), 3_000)
      ),
    ]);
    return c.json({ status: "ready", requestId: c.get("requestId") });
  } catch {
    return c.json({ status: "not_ready", requestId: c.get("requestId") }, 503);
  }
});

app.get("/api/metrics", async c => {
  if (
    !env.metricsSecret ||
    c.req.header("authorization") !== `Bearer ${env.metricsSecret}`
  ) {
    return c.text("Unauthorized", 401);
  }
  const db = getDb();
  const rows = await db
    .select({ status: outboxJobs.status, total: count() })
    .from(outboxJobs)
    .where(
      or(eq(outboxJobs.status, "pending"), eq(outboxJobs.status, "failed"))
    )
    .groupBy(outboxJobs.status);
  const [oldest] = await db
    .select({ availableAt: min(outboxJobs.availableAt) })
    .from(outboxJobs)
    .where(eq(outboxJobs.status, "pending"));
  const oldestDate = oldest?.availableAt
    ? new Date(oldest.availableAt as unknown as string | number | Date)
    : null;
  const queue = {
    pending: 0,
    failed: 0,
    oldestPendingAgeSeconds: oldestDate
      ? Math.max(0, (Date.now() - oldestDate.getTime()) / 1000)
      : 0,
  };
  for (const row of rows) {
    if (row.status === "pending" || row.status === "failed") {
      queue[row.status] = row.total;
    }
  }
  return c.text(renderPrometheusMetrics(queue), 200, {
    "content-type": "text/plain; version=0.0.4; charset=utf-8",
  });
});

app.use(
  "/api/oauth/authorize/:provider",
  rateLimit({ windowMs: 60_000, maxRequests: 20, keyPrefix: "oauth_authorize" })
);
app.get("/api/oauth/authorize/:provider", createOAuthAuthorizeHandler());

app.use(
  "/api/trpc/community.*",
  rateLimit({ windowMs: 60_000, maxRequests: 60, keyPrefix: "community" })
);

app.use(
  Paths.oauthCallback,
  rateLimit({ windowMs: 60_000, maxRequests: 10, keyPrefix: "oauth" })
);
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

app.use(
  "/api/trpc/*",
  rateLimit({ windowMs: 60_000, maxRequests: 120, keyPrefix: "trpc" })
);
app.use("/api/trpc/*", requireTrustedMutationOrigin());
app.use("/api/trpc/*", async c => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: opts => createContext(opts, c.get("requestId")),
  });
});

app.use(
  "/api/webhooks/stripe",
  rateLimit({ windowMs: 60_000, maxRequests: 60, keyPrefix: "stripe" })
);
app.post("/api/webhooks/stripe", async c => {
  if (!env.stripeSecretKey || !env.stripeWebhookSecret) {
    return c.json({ error: "Stripe not configured" }, 500);
  }

  if (!stripeClient) {
    return c.json({ error: "Stripe not configured" }, 500);
  }
  const stripe = stripeClient;
  const signature = c.req.header("stripe-signature");
  if (!signature) {
    return c.json({ error: "Missing stripe-signature" }, 400);
  }

  const payload = await c.req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.stripeWebhookSecret
    );
  } catch (err) {
    console.error("[Stripe] Webhook verification failed:", err);
    return c.json({ error: "Webhook signature verification failed" }, 400);
  }

  try {
    const result = await traced("stripe.webhook", "stripe.webhook", () =>
      processStripeWebhookEvent(event, stripe)
    );
    return c.json({ received: true, ...result });
  } catch (error) {
    console.error("[Stripe] Webhook processing failed:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

app.use(
  "/api/cron/notify",
  rateLimit({ windowMs: 60_000, maxRequests: 10, keyPrefix: "cron" })
);
app.get("/api/cron/notify", async c => {
  const secret = c.req.header("authorization");
  if (!env.cronSecret) {
    return c.json({ error: "CRON_SECRET not configured" }, 500);
  }
  if (secret !== `Bearer ${env.cronSecret}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const taskResult = await notifyUpcomingTasks();
  const studyResult = await sendStudyReminders();
  const outboxResult = await drainOutbox();
  const billingResult = env.stripeSecretKey
    ? await reconcileAllStripeEntitlements()
    : { skipped: true, reason: "Stripe is not configured" };
  return c.json({
    tasks: taskResult,
    study: studyResult,
    outbox: outboxResult,
    reconciliation: billingResult,
  });
});

app.use(
  "/api/cron/outbox",
  rateLimit({ windowMs: 60_000, maxRequests: 10, keyPrefix: "cron_outbox" })
);
app.get("/api/cron/outbox", async c => {
  if (!env.cronSecret) {
    return c.json({ error: "CRON_SECRET not configured" }, 500);
  }
  if (c.req.header("authorization") !== `Bearer ${env.cronSecret}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return c.json({ outbox: await drainOutbox() });
});

app.use(
  "/api/cron/billing",
  rateLimit({ windowMs: 60_000, maxRequests: 5, keyPrefix: "cron_billing" })
);
app.get("/api/cron/billing", async c => {
  if (!env.cronSecret) {
    return c.json({ error: "CRON_SECRET not configured" }, 500);
  }
  if (c.req.header("authorization") !== `Bearer ${env.cronSecret}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return c.json({ reconciliation: await reconcileAllStripeEntitlements() });
});

app.all("/api/*", c => c.json({ error: "Not Found" }, 404));

export default app;
