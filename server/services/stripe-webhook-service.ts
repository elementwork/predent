import type Stripe from "stripe";
import { and, eq, isNull, lte, or } from "drizzle-orm";
import { stripeWebhookEvents, users } from "@db/schema";
import { getDb } from "../queries/connection";
import {
  getInvoiceSubscriptionId,
  getPlanDurationMs,
  getPlanFromPrice,
  getPlanPrices,
  getSubscriptionPeriodEnd,
  getUpgradeKeyFromPrice,
  UPGRADE_DEFINITIONS,
} from "../lib/stripe";
import { incrementCounter, log, observeDuration } from "../lib/observability";

type Tier = "free" | "premium";

type EntitlementUpdate = {
  userId: number;
  expectedSubscriptionId?: string;
  values: {
    tier: Tier;
    stripeSubscriptionId?: string | null;
    stripePriceId?: string | null;
    stripeSubscriptionStatus?: string | null;
    premiumUntil?: Date | null;
  };
};

function objectId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : (value?.id ?? null);
}

export function parseStripeUserId(value: string | undefined): number | null {
  const userId = value ? Number(value) : NaN;
  return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
}

function stackWindow(
  current: Date | null | undefined,
  durationMs: number
): Date {
  const now = Date.now();
  const base =
    current && new Date(current).getTime() > now
      ? new Date(current).getTime()
      : now;
  return new Date(base + durationMs);
}

function subscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = parseStripeUserId(subscription.metadata?.userId);
  if (!userId) return null;
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const plan = priceId ? getPlanFromPrice(priceId) : null;
  if (!plan) {
    throw new Error(`Subscription ${subscription.id} uses an unknown price`);
  }
  const periodEnd = getSubscriptionPeriodEnd(subscription);
  const paid =
    subscription.status === "active" || subscription.status === "trialing";
  if (paid && periodEnd === null) {
    throw new Error(`Subscription ${subscription.id} has no billing period`);
  }
  const grace =
    (subscription.status === "past_due" || subscription.status === "paused") &&
    periodEnd !== null &&
    periodEnd * 1000 > Date.now();
  return {
    userId,
    expectedSubscriptionId: paid || grace ? undefined : subscription.id,
    values:
      paid || grace
        ? {
            tier: "premium" as const,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            stripeSubscriptionStatus: subscription.status,
            premiumUntil: periodEnd ? new Date(periodEnd * 1000) : null,
          }
        : {
            tier: "free" as const,
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeSubscriptionStatus: subscription.status,
            premiumUntil: null,
          },
  } satisfies EntitlementUpdate;
}

async function applyWindowPurchase(
  session: Stripe.Checkout.Session,
  stripe: Stripe
): Promise<EntitlementUpdate> {
  const userId = parseStripeUserId(session.metadata?.userId);
  if (!userId)
    throw new Error("Checkout session is missing userId metadata");
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 1,
  });
  const priceId = lineItems.data[0]?.price?.id ?? null;
  const plan = priceId ? getPlanFromPrice(priceId) : null;
  if (!plan) {
    throw new Error("Checkout uses an unknown plan price");
  }
  return {
    userId,
    values: {
      tier: "premium" as const,
      stripeSubscriptionId: null,
      stripePriceId: priceId,
      stripeSubscriptionStatus: null,
      premiumUntil: stackWindow(null, getPlanDurationMs(plan)),
    },
  };
}

async function applyUpgradePayment(
  session: Stripe.Checkout.Session,
  stripe: Stripe
): Promise<EntitlementUpdate> {
  const userId = parseStripeUserId(session.metadata?.userId);
  if (!userId)
    throw new Error("Checkout session is missing userId metadata");
  const upgradeKey = getUpgradeKeyFromPrice(
    session.metadata?.upgrade ?? ""
  );
  if (!upgradeKey || !UPGRADE_DEFINITIONS[upgradeKey]) {
    throw new Error("Checkout uses an unknown upgrade price");
  }
  const def = UPGRADE_DEFINITIONS[upgradeKey];

  const db = getDb();
  const [user] = await db
    .select({
      tier: users.tier,
      premiumUntil: users.premiumUntil,
      stripePriceId: users.stripePriceId,
      stripeSubscriptionId: users.stripeSubscriptionId,
      stripeCustomerId: users.stripeCustomerId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) throw new Error(`Stripe upgrade references missing user ${userId}`);

  const currentPlan = user.stripePriceId
    ? getPlanFromPrice(user.stripePriceId)
    : null;
  if (currentPlan !== def.from) {
    throw new Error(
      `Upgrade ${upgradeKey} does not match the user's current plan`
    );
  }

  // Cancel any active subscription so it stops auto-renewing after the upgrade.
  if (user.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (error) {
      log("warn", "stripe.upgrade_cancel_failed", {
        userId,
        subscriptionId: user.stripeSubscriptionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    userId,
    values: {
      tier: "premium",
      stripeSubscriptionId: null,
      stripePriceId: getPlanPrices()[def.to],
      stripeSubscriptionStatus: null,
      premiumUntil: stackWindow(user.premiumUntil, getPlanDurationMs(def.to)),
    },
  };
}

async function deriveEntitlementUpdate(
  event: Stripe.Event,
  stripe: Stripe
): Promise<EntitlementUpdate | null> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = parseStripeUserId(session.metadata?.userId);
      if (!userId)
        throw new Error("Checkout session is missing userId metadata");

      if (session.mode === "subscription") {
        const subscriptionId = objectId(session.subscription);
        if (!subscriptionId)
          throw new Error("Checkout is missing subscription");
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        if (session.metadata?.plan !== subscription.metadata?.plan) {
          throw new Error("Checkout and subscription plans do not match");
        }
        return subscriptionUpdate(subscription);
      }

      if (session.mode !== "payment" || session.payment_status !== "paid") {
        throw new Error("Invalid checkout state");
      }

      if (session.metadata?.upgrade) {
        return applyUpgradePayment(session, stripe);
      }

      if (session.metadata?.plan === "premium_3month") {
        return applyWindowPurchase(session, stripe);
      }

      throw new Error("Checkout is missing a valid plan or upgrade");
    }

    case "invoice.paid":
    case "invoice.payment_failed":
    case "invoice.marked_uncollectible":
    case "invoice.voided": {
      const subscriptionId = getInvoiceSubscriptionId(event.data.object);
      if (!subscriptionId) return null;
      return subscriptionUpdate(
        await stripe.subscriptions.retrieve(subscriptionId)
      );
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      return subscriptionUpdate(event.data.object);

    default:
      return null;
  }
}

export async function processStripeWebhookEvent(
  event: Stripe.Event,
  stripe: Stripe
) {
  const started = performance.now();
  try {
    const update = await deriveEntitlementUpdate(event, stripe);
    const db = getDb();
    const result = await db.transaction(async tx => {
      const claimed = await tx
        .insert(stripeWebhookEvents)
        .values({ eventId: event.id, type: event.type })
        .onConflictDoNothing()
        .returning({ id: stripeWebhookEvents.id });
      if (claimed.length === 0) return { duplicate: true };
      if (!update) return { duplicate: false };

      const [existing] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, update.userId))
        .limit(1);
      if (!existing)
        throw new Error(
          `Stripe event references missing user ${update.userId}`
        );

      const eventCreatedAt = new Date(event.created * 1000);
      const orderCondition = or(
        isNull(users.stripeEntitlementUpdatedAt),
        lte(users.stripeEntitlementUpdatedAt, eventCreatedAt)
      );

      await tx
        .update(users)
        .set({ ...update.values, stripeEntitlementUpdatedAt: eventCreatedAt })
        .where(
          and(
            eq(users.id, update.userId),
            orderCondition,
            update.expectedSubscriptionId
              ? eq(users.stripeSubscriptionId, update.expectedSubscriptionId)
              : undefined
          )
        );
      return { duplicate: false };
    });
    incrementCounter("stripe_webhook_processed");
    return result;
  } catch (error) {
    incrementCounter("stripe_webhook_failed");
    log("error", "stripe.webhook_failed", {
      eventId: event.id,
      eventType: event.type,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    observeDuration("stripe_webhook", performance.now() - started);
  }
}
