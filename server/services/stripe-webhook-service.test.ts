import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { users } from "@db/schema";
import { getDb } from "../queries/connection";
import { createTestUser } from "../test-helpers";
import { hasDb } from "../test-db-flag";
import { processStripeWebhookEvent } from "./stripe-webhook-service";

process.env.STRIPE_PRICE_PREMIUM_MONTHLY = "price_monthly_test";
process.env.STRIPE_PRICE_PLUS_LIFETIME = "price_lifetime_test";

function event(type: Stripe.Event.Type, object: unknown): Stripe.Event {
  return {
    id: `evt_${crypto.randomUUID()}`,
    object: "event",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: null,
    type,
    data: { object },
  } as Stripe.Event;
}

function subscription(userId: number, status: Stripe.Subscription.Status) {
  return {
    id: `sub_${userId}`,
    status,
    metadata: { userId: String(userId), plan: "premium_monthly" },
    items: {
      data: [
        {
          price: { id: "price_monthly_test" },
          current_period_end: Math.floor(Date.now() / 1000) + 86_400,
        },
      ],
    },
  } as unknown as Stripe.Subscription;
}

describe.skipIf(!hasDb)("Stripe webhook lifecycle", () => {
  it("grants and then revokes a subscription", async () => {
    const user = await createTestUser();
    const stripe = {} as Stripe;
    await processStripeWebhookEvent(
      event("customer.subscription.updated", subscription(user.id, "active")),
      stripe
    );
    let [row] = await getDb().select().from(users).where(eq(users.id, user.id));
    expect(row.tier).toBe("premium");
    expect(row.stripeSubscriptionStatus).toBe("active");

    await processStripeWebhookEvent(
      event("customer.subscription.deleted", subscription(user.id, "canceled")),
      stripe
    );
    [row] = await getDb().select().from(users).where(eq(users.id, user.id));
    expect(row.tier).toBe("free");
    expect(row.stripeSubscriptionId).toBeNull();
  });

  it("records a lifetime payment and revokes it after a refund", async () => {
    const user = await createTestUser();
    const paymentIntentId = `pi_${user.id}`;
    const stripe = {
      checkout: {
        sessions: {
          listLineItems: async () => ({
            data: [{ price: { id: "price_lifetime_test" } }],
          }),
        },
      },
    } as unknown as Stripe;
    await processStripeWebhookEvent(
      event("checkout.session.completed", {
        id: `cs_${user.id}`,
        mode: "payment",
        payment_status: "paid",
        payment_intent: paymentIntentId,
        metadata: { userId: String(user.id), plan: "plus_lifetime" },
      }),
      stripe
    );
    let [row] = await getDb().select().from(users).where(eq(users.id, user.id));
    expect(row.tier).toBe("premium_plus");

    await processStripeWebhookEvent(
      event("charge.refunded", {
        id: `ch_${user.id}`,
        refunded: true,
        amount_refunded: 14_900,
        payment_intent: paymentIntentId,
        metadata: {},
      }),
      stripe
    );
    [row] = await getDb().select().from(users).where(eq(users.id, user.id));
    expect(row.tier).toBe("free");
    expect(row.stripeLifetimePaymentIntentId).toBeNull();
  });

  it("is idempotent for duplicate event IDs", async () => {
    const user = await createTestUser();
    const stripe = {} as Stripe;
    const webhook = event(
      "customer.subscription.updated",
      subscription(user.id, "active")
    );
    await expect(processStripeWebhookEvent(webhook, stripe)).resolves.toEqual({
      duplicate: false,
    });
    await expect(processStripeWebhookEvent(webhook, stripe)).resolves.toEqual({
      duplicate: true,
    });
  });
});
