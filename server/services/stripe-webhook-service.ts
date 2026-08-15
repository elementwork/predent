import type Stripe from "stripe";
import { and, eq, isNull, lte, ne, or } from "drizzle-orm";
import { stripeWebhookEvents, users } from "@db/schema";
import { getDb } from "../queries/connection";
import {
  getInvoiceSubscriptionId,
  getPlanFromPrice,
  getPlanPrices,
  getSubscriptionPeriodEnd,
  getTierFromPlan,
} from "../lib/stripe";
import { incrementCounter, log, observeDuration } from "../lib/observability";

type Tier = "free" | "premium" | "premium_plus";

type EntitlementUpdate = {
  userId: number;
  expectedSubscriptionId?: string;
  expectedLifetimePaymentIntentId?: string;
  allowLifetimeReplacement?: boolean;
  values: {
    tier: Tier;
    stripeSubscriptionId?: string | null;
    stripePriceId?: string | null;
    stripeSubscriptionStatus?: string | null;
    stripeLifetimePaymentIntentId?: string | null;
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

async function findLifetimeUserId(
  paymentIntentId: string | null,
  metadataUserId?: string
) {
  if (paymentIntentId) {
    const [row] = await getDb()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.stripeLifetimePaymentIntentId, paymentIntentId))
      .limit(1);
    if (row) return row.id;
  }
  return parseStripeUserId(metadataUserId);
}

function subscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = parseStripeUserId(subscription.metadata?.userId);
  if (!userId) return null;
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const plan = priceId ? getPlanFromPrice(priceId) : null;
  if (!plan || plan === "plus_lifetime") {
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
            tier: getTierFromPlan(plan),
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
      if (
        session.mode !== "payment" ||
        session.payment_status !== "paid" ||
        session.metadata?.plan !== "plus_lifetime"
      ) {
        throw new Error("Invalid lifetime checkout state");
      }
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        {
          limit: 1,
        }
      );
      const priceId = lineItems.data[0]?.price?.id ?? null;
      if (!priceId || getPlanFromPrice(priceId) !== "plus_lifetime") {
        throw new Error("Lifetime checkout uses an unknown price");
      }
      const paymentIntentId = objectId(session.payment_intent);
      if (!paymentIntentId)
        throw new Error("Lifetime checkout is missing payment intent");
      return {
        userId,
        allowLifetimeReplacement: true,
        values: {
          tier: "premium_plus",
          stripeSubscriptionId: null,
          stripePriceId: priceId,
          stripeSubscriptionStatus: null,
          stripeLifetimePaymentIntentId: paymentIntentId,
          premiumUntil: null,
        },
      };
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

    case "charge.refunded": {
      const charge = event.data.object;
      if (!charge.refunded && charge.amount_refunded <= 0) return null;
      const paymentIntentId = objectId(charge.payment_intent);
      const userId = await findLifetimeUserId(
        paymentIntentId,
        charge.metadata?.userId
      );
      if (!userId || !paymentIntentId) return null;
      return {
        userId,
        expectedLifetimePaymentIntentId: paymentIntentId,
        values: {
          tier: "free",
          stripePriceId: null,
          stripeLifetimePaymentIntentId: null,
          premiumUntil: null,
        },
      };
    }

    case "charge.dispute.created":
    case "charge.dispute.closed": {
      const dispute = event.data.object;
      const charge =
        typeof dispute.charge === "string"
          ? await stripe.charges.retrieve(dispute.charge)
          : dispute.charge;
      if (!charge) return null;
      const paymentIntentId = objectId(charge.payment_intent);
      const userId = await findLifetimeUserId(
        paymentIntentId,
        charge.metadata?.userId
      );
      if (!userId || !paymentIntentId) return null;
      const restored =
        event.type === "charge.dispute.closed" &&
        dispute.status === "won" &&
        !charge.refunded &&
        charge.amount_refunded === 0;
      return restored
        ? {
            userId,
            allowLifetimeReplacement: true,
            values: {
              tier: "premium_plus",
              stripePriceId: getPlanPrices().plus_lifetime,
              stripeLifetimePaymentIntentId: paymentIntentId,
              premiumUntil: null,
            },
          }
        : {
            userId,
            expectedLifetimePaymentIntentId: paymentIntentId,
            values: {
              tier: "free",
              stripePriceId: null,
              stripeLifetimePaymentIntentId: null,
              premiumUntil: null,
            },
          };
    }

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
      const preserveLifetime =
        update.values.tier === "premium_plus" || update.allowLifetimeReplacement
          ? undefined
          : update.expectedLifetimePaymentIntentId
            ? undefined
            : ne(users.tier, "premium_plus");

      await tx
        .update(users)
        .set({ ...update.values, stripeEntitlementUpdatedAt: eventCreatedAt })
        .where(
          and(
            eq(users.id, update.userId),
            orderCondition,
            preserveLifetime,
            update.expectedSubscriptionId
              ? eq(users.stripeSubscriptionId, update.expectedSubscriptionId)
              : undefined,
            update.expectedLifetimePaymentIntentId
              ? eq(
                  users.stripeLifetimePaymentIntentId,
                  update.expectedLifetimePaymentIntentId
                )
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
