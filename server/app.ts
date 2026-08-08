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
import { users, stripeWebhookEvents, outboxJobs } from "@db/schema";
import { and, count, eq, isNull, lte, ne, or, sql } from "drizzle-orm";
import {
  getInvoiceSubscriptionId,
  getPlanFromPrice,
  getSubscriptionPeriodEnd,
  getTierFromPlan,
} from "./lib/stripe";
import {
  notifyUpcomingTasks,
  sendStudyReminders,
} from "./lib/tasks/notifications";
import { rateLimit } from "./lib/rate-limit";
import { sentryMiddleware } from "./lib/sentry";
import { processOutboxBatch } from "./lib/outbox/worker";
import {
  renderPrometheusMetrics,
  requestObservability,
} from "./lib/observability";
import {
  requireTrustedMutationOrigin,
  securityHeaders,
} from "./lib/security";

type EntitlementUpdate = {
  userId: number;
  expectedSubscriptionId?: string;
  values: {
    tier?: "free" | "premium" | "premium_plus";
    stripeSubscriptionId?: string | null;
    premiumUntil?: Date;
  };
};

function parseStripeUserId(value: string | undefined): number | null {
  const userId = value ? Number(value) : NaN;
  return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
}

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
      getDb().execute(sql`select 1`),
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
  const rows = await getDb()
    .select({ status: outboxJobs.status, total: count() })
    .from(outboxJobs)
    .where(
      or(eq(outboxJobs.status, "pending"), eq(outboxJobs.status, "failed"))
    )
    .groupBy(outboxJobs.status);
  const queue = { pending: 0, failed: 0 };
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

  let entitlementUpdate: EntitlementUpdate | null = null;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = parseStripeUserId(session.metadata?.userId);
      if (!userId) {
        return c.json({ error: "Missing userId in session metadata" }, 400);
      }

      if (session.mode === "subscription") {
        if (typeof session.subscription !== "string") {
          return c.json({ error: "Missing subscription id" }, 400);
        }
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription
        );
        const sub = subscription;
        if (sub.status !== "active" && sub.status !== "trialing") {
          return c.json({ error: "Inactive subscription" }, 400);
        }
        const item = sub.items.data[0];
        const priceId = item?.price.id;
        const plan = priceId ? getPlanFromPrice(priceId) : null;
        if (
          !plan ||
          plan === "plus_lifetime" ||
          session.metadata?.plan !== plan
        ) {
          console.error("[Stripe] Rejected subscription checkout plan", {
            eventId: event.id,
            priceId,
            checkoutPlan: session.metadata?.plan,
          });
          return c.json({ error: "Invalid subscription plan" }, 400);
        }
        const tier = getTierFromPlan(plan);

        const currentPeriodEnd = getSubscriptionPeriodEnd(sub);
        if (!currentPeriodEnd) {
          return c.json({ error: "Missing subscription billing period" }, 400);
        }
        entitlementUpdate = {
          userId,
          values: {
            tier,
            stripeSubscriptionId: sub.id,
            premiumUntil: new Date(currentPeriodEnd * 1000),
          },
        };
      } else if (session.mode === "payment") {
        if (
          session.payment_status !== "paid" ||
          session.metadata?.plan !== "plus_lifetime"
        ) {
          return c.json({ error: "Invalid lifetime payment" }, 400);
        }
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { limit: 1 }
        );
        const priceId = lineItems.data[0]?.price?.id;
        if (getPlanFromPrice(priceId ?? "") !== "plus_lifetime") {
          console.error("[Stripe] Rejected lifetime checkout price", {
            eventId: event.id,
            priceId,
          });
          return c.json({ error: "Invalid lifetime price" }, 400);
        }

        entitlementUpdate = {
          userId,
          values: {
            tier: "premium_plus",
            premiumUntil: new Date(
              Date.now() + 100 * 365 * 24 * 60 * 60 * 1000
            ), // ~100 years
          },
        };
      } else {
        return c.json({ error: "Unsupported checkout mode" }, 400);
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = getInvoiceSubscriptionId(invoice);
      if (subscriptionId) {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const sub = subscription;
        const userId = parseStripeUserId(sub.metadata?.userId);
        const priceId = sub.items.data[0]?.price.id;
        const plan = priceId ? getPlanFromPrice(priceId) : null;
        if (!userId || !plan || plan === "plus_lifetime") {
          console.error("[Stripe] Rejected paid invoice subscription", {
            eventId: event.id,
            priceId,
            userId,
          });
          return c.json({ error: "Invalid invoice subscription" }, 400);
        }
        const currentPeriodEnd = getSubscriptionPeriodEnd(sub);
        if (!currentPeriodEnd) {
          return c.json({ error: "Missing subscription billing period" }, 400);
        }
        entitlementUpdate = {
          userId,
          values: {
            tier: getTierFromPlan(plan),
            stripeSubscriptionId: sub.id,
            premiumUntil: new Date(currentPeriodEnd * 1000),
          },
        };
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = parseStripeUserId(subscription.metadata?.userId);
      if (userId) {
        entitlementUpdate = {
          userId,
          expectedSubscriptionId: subscription.id,
          values: {
            tier: "free",
            stripeSubscriptionId: null,
            premiumUntil: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        };
      }
      break;
    }
  }

  const db = getDb();
  try {
    const transactionResult = await db.transaction(async tx => {
      const claimed = await tx
        .insert(stripeWebhookEvents)
        .values({ eventId: event.id, type: event.type })
        .onConflictDoNothing()
        .returning({ id: stripeWebhookEvents.id });

      if (claimed.length === 0) {
        return { duplicate: true };
      }

      if (!entitlementUpdate) {
        return { duplicate: false };
      }

      const [user] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, entitlementUpdate.userId))
        .limit(1);
      if (!user) {
        throw new Error(
          `Stripe event ${event.id} references missing user ${entitlementUpdate.userId}`
        );
      }

      const eventCreatedAt = new Date(event.created * 1000);
      const orderCondition =
        entitlementUpdate.values.tier === "premium_plus"
          ? undefined
          : or(
              isNull(users.stripeEntitlementUpdatedAt),
              lte(users.stripeEntitlementUpdatedAt, eventCreatedAt)
            );
      const preserveLifetimeCondition =
        entitlementUpdate.values.tier === "premium_plus"
          ? undefined
          : ne(users.tier, "premium_plus");

      await tx
        .update(users)
        .set({
          ...entitlementUpdate.values,
          stripeEntitlementUpdatedAt: eventCreatedAt,
        })
        .where(
          and(
            eq(users.id, entitlementUpdate.userId),
            orderCondition,
            preserveLifetimeCondition,
            entitlementUpdate.expectedSubscriptionId
              ? eq(
                  users.stripeSubscriptionId,
                  entitlementUpdate.expectedSubscriptionId
                )
              : undefined
          )
        );

      return { duplicate: false };
    });

    return c.json({ received: true, ...transactionResult });
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
  const outboxResult = await processOutboxBatch(100);
  return c.json({
    tasks: taskResult,
    study: studyResult,
    outbox: outboxResult,
  });
});

app.all("/api/*", c => c.json({ error: "Not Found" }, 404));

export default app;
