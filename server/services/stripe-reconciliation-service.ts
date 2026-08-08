import type Stripe from "stripe";
import { and, asc, eq, gt, isNotNull, ne, or } from "drizzle-orm";
import { adminActions, users } from "@db/schema";
import { getDb } from "../queries/connection";
import {
  getPlanFromPrice,
  getStripe,
  getSubscriptionPeriodEnd,
  getTierFromPlan,
} from "../lib/stripe";

type Tier = "free" | "premium" | "premium_plus";

export type EntitlementAuditRow = {
  userId: number;
  status: "in_sync" | "drift" | "manual_review";
  reason: string;
  local: {
    tier: Tier;
    subscriptionId: string | null;
    premiumUntil: Date | null;
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
  subscription: Stripe.Subscription | null;
}): Omit<EntitlementAuditRow, "userId" | "applied"> {
  const local = {
    tier: input.localTier,
    subscriptionId: input.localSubscriptionId,
    premiumUntil: input.localPremiumUntil,
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
    };
    const inSync =
      input.localTier === recommended.tier &&
      input.localSubscriptionId === null &&
      input.localPremiumUntil === null;
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

  if (active && !plan) {
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

  const currentPeriodEnd = getSubscriptionPeriodEnd(input.subscription);
  if (active && !currentPeriodEnd) {
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

  const recommended = active
    ? {
        tier: getTierFromPlan(plan!),
        subscriptionId: input.subscription.id,
        premiumUntil: new Date(currentPeriodEnd! * 1000),
      }
    : {
        tier: "free" as const,
        subscriptionId: null,
        premiumUntil: null,
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

  return {
    status: inSync ? "in_sync" : "drift",
    reason: active
      ? "Local entitlement must match the active Stripe subscription."
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
    })
    .from(users)
    .where(
      and(
        or(
          ne(users.tier, "free"),
          isNotNull(users.stripeSubscriptionId),
          isNotNull(users.stripeCustomerId)
        ),
        input.afterId ? gt(users.id, input.afterId) : undefined
      )
    )
    .orderBy(asc(users.id))
    .limit(input.limit);

  const auditRows = await mapWithConcurrency(rows, 5, async user => {
    let subscription: Stripe.Subscription | null = null;
    if (user.stripeSubscriptionId && user.tier !== "premium_plus") {
      try {
        subscription = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode !== 404) throw error;
      }
    } else if (user.stripeCustomerId && user.tier !== "premium_plus") {
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
