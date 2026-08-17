import Stripe from "stripe";
import { env } from "./env";

export type StripePlan = "premium_monthly" | "premium_3month" | "premium_yearly";

export const PLAN_LIST_PRICE_CENTS: Record<StripePlan, number> = {
  premium_monthly: 39_00,
  premium_3month: 99_00,
  premium_yearly: 249_00,
};

export const PLAN_DURATION_MS: Record<StripePlan, number> = {
  premium_monthly: 30 * 24 * 60 * 60 * 1000,
  premium_3month: 90 * 24 * 60 * 60 * 1000,
  premium_yearly: 365 * 24 * 60 * 60 * 1000,
};

export function getPlanListPriceCents(plan: StripePlan): number {
  return PLAN_LIST_PRICE_CENTS[plan] ?? 0;
}

export function getPlanDurationMs(plan: StripePlan): number {
  return PLAN_DURATION_MS[plan] ?? 0;
}

export type UpgradeKey =
  | "from_monthly_to_3month"
  | "from_monthly_to_yearly"
  | "from_3month_to_yearly";

export const UPGRADE_DEFINITIONS: Record<
  UpgradeKey,
  { from: StripePlan; to: StripePlan }
> = {
  from_monthly_to_3month: { from: "premium_monthly", to: "premium_3month" },
  from_monthly_to_yearly: { from: "premium_monthly", to: "premium_yearly" },
  from_3month_to_yearly: { from: "premium_3month", to: "premium_yearly" },
};

export function getPlanPrices(): Record<StripePlan, string> {
  return {
    premium_monthly: env.stripePricePremiumMonthly,
    premium_3month: env.stripePricePremium3Month,
    premium_yearly: env.stripePricePremiumYearly,
  };
}

/** Upgrade top-up prices (CAD) used for pay-the-difference plan upgrades. */
export function getUpgradePrices(): Record<UpgradeKey, string> {
  return {
    from_monthly_to_3month: env.stripePriceUpgradeMonthlyTo3Month,
    from_monthly_to_yearly: env.stripePriceUpgradeMonthlyToYearly,
    from_3month_to_yearly: env.stripePriceUpgrade3MonthToYearly,
  };
}

export function getStripe(): Stripe | null {
  if (!env.stripeSecretKey) return null;
  return new Stripe(env.stripeSecretKey);
}

export function getPlanFromPrice(priceId: string): StripePlan | null {
  for (const [plan, id] of Object.entries(getPlanPrices())) {
    if (id && id === priceId) return plan as StripePlan;
  }
  return null;
}

export function getUpgradeKeyFromPrice(priceId: string): UpgradeKey | null {
  for (const [key, id] of Object.entries(getUpgradePrices())) {
    if (id && id === priceId) return key as UpgradeKey;
  }
  return null;
}

export function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription
): number | null {
  const currentItemPeriod = subscription.items.data[0]?.current_period_end;
  if (typeof currentItemPeriod === "number") return currentItemPeriod;

  // Stripe API versions before 2025-03-31 exposed this on Subscription.
  const legacyPeriod = (
    subscription as unknown as {
      current_period_end?: unknown;
    }
  ).current_period_end;
  return typeof legacyPeriod === "number" ? legacyPeriod : null;
}

export function getInvoiceSubscriptionId(
  invoice: Stripe.Invoice
): string | null {
  const modern = invoice.parent?.subscription_details?.subscription;
  if (typeof modern === "string") return modern;
  if (modern?.id) return modern.id;

  // Keep accepting webhook events created with older Stripe API versions.
  const legacy = (invoice as unknown as { subscription?: unknown })
    .subscription;
  if (typeof legacy === "string") return legacy;
  if (legacy && typeof legacy === "object" && "id" in legacy) {
    const id = (legacy as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}
