import type Stripe from "stripe";
import { and, asc, eq, gt, isNotNull, ne, or } from "drizzle-orm";
import { adminActions, users } from "@db/schema";
import { getDb } from "../queries/connection";
import {
  getPlanFromPrice,
  getPlanPrices,
  getStripe,
  getSubscriptionPeriodEnd,
  getTierFromPlan,
} from "../lib/stripe";
import { incrementCounter } from "../lib/observability";

type Tier = "free" | "premium" | "premium_plus";

export type EntitlementAuditRow = {
  userId: number;
  status: "in_sync" | "drift" | "manual_review";
  reason: string;
  local: {
    tier: Tier;
    subscriptionId: string | null;
    premiumUntil: Date | null;
    priceId?: string | null;
    subscriptionStatus?: string | null;
    lifetimePaymentIntentId?: string | null;
  };
  stripe: {
    status: string;
    priceId: string | null;
    tier: Tier | null;
    premiumUntil: Date | null;
  } | null;
  recommended: {
    tier: Tier;
    subscriptionId: string | null;
    premiumUntil: Date | null;
    priceId?: string | null;
    subscriptionStatus?: string | null;
  } | null;
  applied: boolean;
};

function sameInstant(left: Date | null, right: Date | null): boolean {
  return left?.getTime() === right?.getTime();
}

export function deriveStripeEntitlement(input: {
  localTier: Tier;
  localSubscriptionId: string | null;
  localPremiumUntil: Date | null;
  localPriceId?: string | null;
  localSubscriptionStatus?: string | null;
  subscription: Stripe.Subscription | null;
}): Omit<EntitlementAuditRow, "userId" | "applied"> {
  const local = {
    tier: input.localTier,
    subscriptionId: input.localSubscriptionId,
    premiumUntil: input.localPremiumUntil,
    priceId: input.localPriceId ?? null,
    subscriptionStatus: input.localSubscriptionStatus ?? null,
  };

  if (input.localTier === "premium_plus") {
    return {
      status: "in_sync",
      reason: "Lifetime entitlement is not downgraded by subscription state.",
      local,
      stripe: null,
      recommended: null,
    };
  }

  if (!input.subscription) {
    const recommended = {
      tier: "free" as const,
      subscriptionId: null,
      premiumUntil: null,
      priceId: null,
      subscriptionStatus: null,
    };
    const inSync =
      input.localTier === recommended.tier &&
      input.localSubscriptionId === null &&
      input.localPremiumUntil === null &&
      (input.localPriceId === undefined || input.localPriceId === null) &&
      (input.localSubscriptionStatus === undefined ||
        input.localSubscriptionStatus === null);
    return {
      status: inSync ? "in_sync" : "drift",
      reason: "No Stripe subscription is attached to the local entitlement.",
      local,
      stripe: null,
      recommended,
    };
  }

  const priceId = input.subscription.items.data[0]?.price.id ?? null;
  const plan = priceId ? getPlanFromPrice(priceId) : null;
  const active =
    input.subscription.status === "active" ||
    input.subscription.status === "trialing";
  const currentPeriodEnd = getSubscriptionPeriodEnd(input.subscription);
  const grace =
    (input.subscription.status === "past_due" ||
      input.subscription.status === "paused") &&
    currentPeriodEnd !== null &&
    currentPeriodEnd * 1000 > Date.now();
  const entitled = active || grace;

  if (entitled && !plan) {
    return {
      status: "manual_review",
      reason: "Active Stripe subscription uses an unknown price.",
      local,
      stripe: {
        status: input.subscription.status,
        priceId,
        tier: null,
        premiumUntil: null,
      },
      recommended: null,
    };
  }

  if (entitled && !currentPeriodEnd) {
    return {
      status: "manual_review",
      reason: "Active Stripe subscription has no current billing period.",
      local,
      stripe: {
        status: input.subscription.status,
        priceId,
        tier: getTierFromPlan(plan!),
        premiumUntil: null,
      },
      recommended: null,
    };
  }

  const recommended = entitled
    ? {
        tier: getTierFromPlan(plan!),
        subscriptionId: input.subscription.id,
        premiumUntil: new Date(currentPeriodEnd! * 1000),
        priceId,
        subscriptionStatus: input.subscription.status,
      }
    : {
        tier: "free" as const,
        subscriptionId: null,
        premiumUntil: null,
        priceId: null,
        subscriptionStatus: input.subscription.status,
      };
  const stripe = {
    status: input.subscription.status,
    priceId,
    tier: recommended.tier,
    premiumUntil: recommended.premiumUntil,
  };
  const inSync =
    local.tier === recommended.tier &&
    local.subscriptionId === recommended.subscriptionId &&
    sameInstant(local.premiumUntil, recommended.premiumUntil);
  const metadataInSync =
    (input.localPriceId === undefined ||
      local.priceId === recommended.priceId) &&
    (input.localSubscriptionStatus === undefined ||
      local.subscriptionStatus === recommended.subscriptionStatus);

  return {
    status: inSync && metadataInSync ? "in_sync" : "drift",
    reason: entitled
      ? "Local entitlement must match the paid or in-grace Stripe subscription."
      : `Stripe subscription is ${input.subscription.status}.`,
    local,
    stripe,
    recommended,
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await mapper(items[index]);
      }
    })
  );
  return results;
}

export async function reconcileStripeEntitlements(input: {
  adminId: number;
  afterId?: number;
  limit: number;
  apply: boolean;
}) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      tier: users.tier,
      stripeSubscriptionId: users.stripeSubscriptionId,
      stripeCustomerId: users.stripeCustomerId,
      premiumUntil: users.premiumUntil,
      stripeLifetimePaymentIntentId: users.stripeLifetimePaymentIntentId,
      stripePriceId: users.stripePriceId,
      stripeSubscriptionStatus: users.stripeSubscriptionStatus,
    })
    .from(users)
    .where(
      and(
        or(
          ne(users.tier, "free"),
          isNotNull(users.stripeSubscriptionId),
          isNotNull(users.stripeCustomerId),
          isNotNull(users.stripeLifetimePaymentIntentId)
        ),
        input.afterId ? gt(users.id, input.afterId) : undefined
      )
    )
    .orderBy(asc(users.id))
    .limit(input.limit);

  const auditRows = await mapWithConcurrency(rows, 5, async user => {
    if (user.tier === "premium_plus" || user.stripeLifetimePaymentIntentId) {
      const local = {
        tier: user.tier,
        subscriptionId: user.stripeSubscriptionId,
        premiumUntil: user.premiumUntil,
        priceId: user.stripePriceId,
        subscriptionStatus: user.stripeSubscriptionStatus,
        lifetimePaymentIntentId: user.stripeLifetimePaymentIntentId,
      };
      if (!user.stripeLifetimePaymentIntentId) {
        return {
          userId: user.id,
          status: "manual_review" as const,
          reason: "Legacy lifetime entitlement has no Stripe payment intent.",
          local,
          stripe: null,
          recommended: null,
          applied: false,
        };
      }
      let paymentIntent: Stripe.PaymentIntent;
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(
          user.stripeLifetimePaymentIntentId
        );
      } catch (error) {
        if ((error as { statusCode?: number }).statusCode !== 404) throw error;
        return {
          userId: user.id,
          status: "manual_review" as const,
          reason: "Lifetime payment intent no longer exists in Stripe.",
          local,
          stripe: null,
          recommended: null,
          applied: false,
        };
      }
      const chargeId =
        typeof paymentIntent.latest_charge === "string"
          ? paymentIntent.latest_charge
          : paymentIntent.latest_charge?.id;
      const charge = chargeId ? await stripe.charges.retrieve(chargeId) : null;
      const valid =
        paymentIntent.status === "succeeded" &&
        charge !== null &&
        !charge.refunded &&
        charge.amount_refunded === 0 &&
        !charge.disputed;
      const entitlementMatches = valid && user.tier === "premium_plus";
      const result: EntitlementAuditRow = {
        userId: user.id,
        status: entitlementMatches ? "in_sync" : "drift",
        reason: valid
          ? "Lifetime payment is paid and undisputed."
          : "Lifetime payment is refunded, disputed, or no longer paid.",
        local,
        stripe: {
          status: paymentIntent.status,
          priceId: null,
          tier: valid ? "premium_plus" : "free",
          premiumUntil: null,
        },
        recommended: entitlementMatches
          ? null
          : valid
            ? {
                tier: "premium_plus",
                subscriptionId: null,
                premiumUntil: null,
                priceId: getPlanPrices().plus_lifetime,
                subscriptionStatus: null,
              }
            : {
                tier: "free",
                subscriptionId: null,
                premiumUntil: null,
                priceId: null,
                subscriptionStatus: null,
              },
        applied: false,
      };
      if (input.apply && result.status === "drift" && result.recommended) {
        await db.transaction(async tx => {
          await tx
            .update(users)
            .set({
              tier: result.recommended!.tier,
              stripeLifetimePaymentIntentId: valid
                ? user.stripeLifetimePaymentIntentId
                : null,
              stripePriceId: result.recommended!.priceId ?? null,
              premiumUntil: null,
              stripeEntitlementUpdatedAt: new Date(),
            })
            .where(eq(users.id, user.id));
          await tx.insert(adminActions).values({
            adminId: input.adminId,
            action: "reconcile_stripe",
            targetType: "user",
            targetId: user.id,
            metadata: {
              previous: local,
              stripe: result.stripe,
              reason: result.reason,
            },
          });
        });
        result.applied = true;
      }
      return result;
    }
    let subscription: Stripe.Subscription | null = null;
    if (user.stripeSubscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode !== 404) throw error;
      }
    } else if (user.stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
        limit: 10,
      });
      const active = subscriptions.data.filter(
        candidate =>
          candidate.status === "active" || candidate.status === "trialing"
      );
      if (active.length > 1) {
        return {
          userId: user.id,
          status: "manual_review" as const,
          reason: "Stripe customer has multiple active subscriptions.",
          local: {
            tier: user.tier,
            subscriptionId: user.stripeSubscriptionId,
            premiumUntil: user.premiumUntil,
            priceId: user.stripePriceId,
            subscriptionStatus: user.stripeSubscriptionStatus,
          },
          stripe: null,
          recommended: null,
          applied: false,
        };
      }
      subscription = active[0] ?? subscriptions.data[0] ?? null;
    }

    const result: EntitlementAuditRow = {
      userId: user.id,
      ...deriveStripeEntitlement({
        localTier: user.tier,
        localSubscriptionId: user.stripeSubscriptionId,
        localPremiumUntil: user.premiumUntil,
        localPriceId: user.stripePriceId,
        localSubscriptionStatus: user.stripeSubscriptionStatus,
        subscription,
      }),
      applied: false,
    };

    if (input.apply && result.status === "drift" && result.recommended) {
      const previous = result.local;
      await db.transaction(async tx => {
        await tx
          .update(users)
          .set({
            tier: result.recommended!.tier,
            stripeSubscriptionId: result.recommended!.subscriptionId,
            premiumUntil: result.recommended!.premiumUntil,
            stripePriceId: result.recommended!.priceId ?? null,
            stripeSubscriptionStatus:
              result.recommended!.subscriptionStatus ?? null,
            stripeEntitlementUpdatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
        await tx.insert(adminActions).values({
          adminId: input.adminId,
          action: "reconcile_stripe",
          targetType: "user",
          targetId: user.id,
          metadata: {
            previous,
            recommended: result.recommended,
            stripe: result.stripe,
            reason: result.reason,
          },
        });
      });
      result.applied = true;
    }
    return result;
  });
  for (const row of auditRows) {
    if (row.status === "drift") incrementCounter("stripe_reconciliation_drift");
  }

  return {
    items: auditRows,
    nextCursor: rows.length === input.limit ? (rows.at(-1)?.id ?? null) : null,
    summary: {
      checked: auditRows.length,
      inSync: auditRows.filter(row => row.status === "in_sync").length,
      drift: auditRows.filter(row => row.status === "drift").length,
      manualReview: auditRows.filter(row => row.status === "manual_review")
        .length,
      applied: auditRows.filter(row => row.applied).length,
    },
  };
}

export async function reconcileAllStripeEntitlements() {
  const [owner] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.provider, "google"),
        eq(users.unionId, process.env.OWNER_UNION_ID ?? "")
      )
    )
    .limit(1);
  if (!owner)
    return { skipped: true, reason: "Owner admin is not provisioned" };
  let afterId: number | undefined;
  const total = { checked: 0, drift: 0, manualReview: 0, applied: 0 };
  for (let page = 0; page < 100; page++) {
    const result = await reconcileStripeEntitlements({
      adminId: owner.id,
      afterId,
      limit: 100,
      apply: true,
    });
    total.checked += result.summary.checked;
    total.drift += result.summary.drift;
    total.manualReview += result.summary.manualReview;
    total.applied += result.summary.applied;
    if (!result.nextCursor) return { skipped: false, ...total };
    afterId = result.nextCursor;
  }
  throw new Error("Stripe reconciliation exceeded 10,000 accounts");
}
