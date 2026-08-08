import Stripe from "stripe";
import { env } from "./env";

export type StripePlan = "premium_monthly" | "premium_yearly" | "plus_lifetime";

export function getPlanPrices(): Record<StripePlan, string> {
  return {
    premium_monthly: env.stripePricePremiumMonthly,
    premium_yearly: env.stripePricePremiumYearly,
    plus_lifetime: env.stripePricePlusLifetime,
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

export function getTierFromPlan(plan: StripePlan): "premium" | "premium_plus" {
  return plan === "plus_lifetime" ? "premium_plus" : "premium";
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
