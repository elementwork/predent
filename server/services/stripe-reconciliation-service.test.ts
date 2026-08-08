import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { deriveStripeEntitlement } from "./stripe-reconciliation-service";

const originalMonthlyPrice = process.env.STRIPE_PRICE_PREMIUM_MONTHLY;

function subscription(
  overrides: Partial<Stripe.Subscription> & { current_period_end?: number } = {}
) {
  return {
    id: "sub_123",
    status: "active",
    items: {
      data: [
        {
          price: { id: "price_monthly" },
          current_period_end: 2_000_000_000,
        },
      ],
    },
    ...overrides,
  } as Stripe.Subscription;
}

beforeEach(() => {
  process.env.STRIPE_PRICE_PREMIUM_MONTHLY = "price_monthly";
});

afterEach(() => {
  if (originalMonthlyPrice === undefined) {
    delete process.env.STRIPE_PRICE_PREMIUM_MONTHLY;
  } else {
    process.env.STRIPE_PRICE_PREMIUM_MONTHLY = originalMonthlyPrice;
  }
});

describe("Stripe entitlement reconciliation policy", () => {
  it("detects drift from an active configured subscription", () => {
    const result = deriveStripeEntitlement({
      localTier: "free",
      localSubscriptionId: null,
      localPremiumUntil: null,
      subscription: subscription(),
    });

    expect(result.status).toBe("drift");
    expect(result.recommended).toEqual({
      tier: "premium",
      subscriptionId: "sub_123",
      premiumUntil: new Date(2_000_000_000 * 1000),
    });
  });

  it("fails to manual review for an unknown active price", () => {
    const result = deriveStripeEntitlement({
      localTier: "premium",
      localSubscriptionId: "sub_123",
      localPremiumUntil: new Date(2_000_000_000 * 1000),
      subscription: subscription({
        items: {
          data: [{ price: { id: "price_unknown" } }],
        } as Stripe.ApiList<Stripe.SubscriptionItem>,
      }),
    });

    expect(result.status).toBe("manual_review");
    expect(result.recommended).toBeNull();
  });

  it("never downgrades lifetime access", () => {
    const result = deriveStripeEntitlement({
      localTier: "premium_plus",
      localSubscriptionId: null,
      localPremiumUntil: new Date("2099-01-01T00:00:00.000Z"),
      subscription: null,
    });

    expect(result.status).toBe("in_sync");
    expect(result.recommended).toBeNull();
  });

  it("removes an inactive subscription entitlement", () => {
    const result = deriveStripeEntitlement({
      localTier: "premium",
      localSubscriptionId: "sub_123",
      localPremiumUntil: new Date(2_000_000_000 * 1000),
      subscription: subscription({ status: "canceled" }),
    });

    expect(result.status).toBe("drift");
    expect(result.recommended).toEqual({
      tier: "free",
      subscriptionId: null,
      premiumUntil: null,
    });
  });
});
