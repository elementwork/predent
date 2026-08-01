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
import { users, stripeWebhookEvents } from "@db/schema";
import { eq } from "drizzle-orm";
import { getPlanFromPrice, getTierFromPlan } from "./payment-router";
import { notifyUpcomingTasks, sendStudyReminders } from "./lib/tasks/notifications";
import { rateLimit } from "./lib/rate-limit";
import { sentryMiddleware } from "./lib/sentry";

type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_end: number;
};

type StripeInvoiceWithSubscription = Stripe.Invoice & {
  subscription: string;
};

const app = new Hono<{ Bindings: HttpBindings }>();

const stripeClient = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

app.use(bodyLimit({ maxSize: 1 * 1024 * 1024 })); // 1MB — no file uploads needed
app.use(sentryMiddleware());

app.use(
  "/api/oauth/authorize/:provider",
  rateLimit({ windowMs: 60_000, maxRequests: 20, keyPrefix: "oauth_authorize" })
);
app.get("/api/oauth/authorize/:provider", createOAuthAuthorizeHandler());

app.use(
  Paths.oauthCallback,
  rateLimit({ windowMs: 60_000, maxRequests: 10, keyPrefix: "oauth" })
);
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

app.use(
  "/api/trpc/*",
  rateLimit({ windowMs: 60_000, maxRequests: 120, keyPrefix: "trpc" })
);
app.use("/api/trpc/*", async c => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
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

  const db = getDb();

  // Idempotency: skip events that have already been processed
  const [existing] = await db
    .select({ id: stripeWebhookEvents.id })
    .from(stripeWebhookEvents)
    .where(eq(stripeWebhookEvents.eventId, event.id))
    .limit(1);
  if (existing) {
    return c.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId
        ? parseInt(session.metadata.userId)
        : null;
      if (!userId) {
        return c.json({ error: "Missing userId in session metadata" }, 400);
      }

      if (session.mode === "subscription") {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const sub = subscription as unknown as StripeSubscriptionWithPeriod;
        const item = sub.items.data[0];
        const priceId = item?.price.id;
        const plan = priceId ? getPlanFromPrice(priceId) : null;
        const tier = plan ? getTierFromPlan(plan) : "premium";

        await db
          .update(users)
          .set({
            tier,
            stripeSubscriptionId: sub.id,
            premiumUntil: new Date(sub.current_period_end * 1000),
          })
          .where(eq(users.id, userId));
      } else if (session.mode === "payment") {
        // Plus lifetime
        await db
          .update(users)
          .set({
            tier: "premium_plus",
            premiumUntil: new Date(
              Date.now() + 100 * 365 * 24 * 60 * 60 * 1000
            ), // ~100 years
          })
          .where(eq(users.id, userId));
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as StripeInvoiceWithSubscription;
      const subscriptionId = invoice.subscription;
      if (subscriptionId) {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const sub = subscription as unknown as StripeSubscriptionWithPeriod;
        const userId = sub.metadata?.userId
          ? parseInt(sub.metadata.userId)
          : null;
        if (userId) {
          await db
            .update(users)
            .set({
              premiumUntil: new Date(sub.current_period_end * 1000),
            })
            .where(eq(users.id, userId));
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId
        ? parseInt(subscription.metadata.userId)
        : null;
      if (userId) {
        await db
          .update(users)
          .set({
            tier: "free",
            stripeSubscriptionId: null,
            premiumUntil: new Date(Date.now() - 24 * 60 * 60 * 1000),
          })
          .where(eq(users.id, userId));
      }
      break;
    }
  }

  // Record successful processing
  await db
    .insert(stripeWebhookEvents)
    .values({ eventId: event.id, type: event.type })
    .onConflictDoNothing();

  return c.json({ received: true });
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
  return c.json({ tasks: taskResult, study: studyResult });
});

app.all("/api/*", c => c.json({ error: "Not Found" }, 404));

export default app;
