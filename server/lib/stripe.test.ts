import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { getInvoiceSubscriptionId, getSubscriptionPeriodEnd } from "./stripe";

describe("Stripe API-version compatibility", () => {
  it("reads the current billing period from a Stripe v22 subscription item", () => {
    const subscription = {
      items: { data: [{ current_period_end: 2_000_000_000 }] },
    } as unknown as Stripe.Subscription;

    expect(getSubscriptionPeriodEnd(subscription)).toBe(2_000_000_000);
  });

  it("accepts modern and legacy invoice subscription locations", () => {
    const modern = {
      parent: {
        subscription_details: { subscription: "sub_modern" },
      },
    } as unknown as Stripe.Invoice;
    const legacy = {
      subscription: "sub_legacy",
    } as unknown as Stripe.Invoice;

    expect(getInvoiceSubscriptionId(modern)).toBe("sub_modern");
    expect(getInvoiceSubscriptionId(legacy)).toBe("sub_legacy");
  });
});
