import { z } from "zod";
import Stripe from "stripe";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import {
  getPlanDurationMs,
  getPlanFromPrice,
  getPlanListPriceCents,
  getPlanPrices,
  getStripe,
  getUpgradePrices,
  type UpgradeKey,
  UPGRADE_DEFINITIONS,
} from "./lib/stripe";
import { getPublicAppOrigin } from "./lib/origin";

const planSchema = z.enum([
  "premium_monthly",
  "premium_3month",
  "premium_yearly",
]);

const upgradeTargetSchema = z.enum(["premium_3month", "premium_yearly"]);

export const paymentRouter = createRouter({
  createCheckoutSession: authedQuery
    .input(z.object({ plan: planSchema }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe is not configured",
        });
      }

      const priceId = getPlanPrices()[input.plan];
      if (!priceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No price configured for plan: ${input.plan}`,
        });
      }

      const db = getDb();
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          stripeCustomerId: users.stripeCustomerId,
        })
        .from(users)
        .where(eq(users.id, ctx.user.id));

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          metadata: { userId: String(user.id) },
        });
        customerId = customer.id;
        await db
          .update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, user.id));
      }

      // Monthly and Annual auto-renew; the 3-Month plan is a one-time window.
      const mode: Stripe.Checkout.SessionCreateParams.Mode =
        input.plan === "premium_3month" ? "payment" : "subscription";

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode,
        success_url: `${getOrigin()}/pricing?success=true`,
        cancel_url: `${getOrigin()}/pricing?canceled=true`,
        metadata: {
          userId: String(ctx.user.id),
          plan: input.plan,
        },
        subscription_data:
          mode === "subscription"
            ? { metadata: { userId: String(ctx.user.id), plan: input.plan } }
            : undefined,
        payment_intent_data:
          mode === "payment"
            ? { metadata: { userId: String(ctx.user.id), plan: input.plan } }
            : undefined,
      });

      return { url: session.url };
    }),

  upgrade: authedQuery
    .input(z.object({ plan: upgradeTargetSchema }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe is not configured",
        });
      }

      const db = getDb();
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          stripeCustomerId: users.stripeCustomerId,
          stripePriceId: users.stripePriceId,
          premiumUntil: users.premiumUntil,
          stripeSubscriptionId: users.stripeSubscriptionId,
        })
        .from(users)
        .where(eq(users.id, ctx.user.id));

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const currentPlan = user.stripePriceId
        ? getPlanFromPrice(user.stripePriceId)
        : null;
      if (currentPlan === input.plan) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already on this plan",
        });
      }

      const upgradeKey = (Object.keys(UPGRADE_DEFINITIONS) as UpgradeKey[]).find(
        key =>
          UPGRADE_DEFINITIONS[key].from === currentPlan &&
          UPGRADE_DEFINITIONS[key].to === input.plan
      );
      if (!upgradeKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No upgrade path from your current plan",
        });
      }

      const dueCents =
        getPlanListPriceCents(input.plan) -
        (currentPlan ? getPlanListPriceCents(currentPlan) : 0);

      // Already paid at least the target plan's price — apply the upgrade now.
      if (dueCents <= 0) {
        const premiumUntil = stackWindow(
          user.premiumUntil,
          getPlanDurationMs(input.plan)
        );
        await db
          .update(users)
          .set({
            tier: "premium",
            stripePriceId: getPlanPrices()[input.plan],
            stripeSubscriptionId: null,
            premiumUntil,
          })
          .where(eq(users.id, user.id));
        return { url: null, applied: true };
      }

      const upgradePriceId = getUpgradePrices()[upgradeKey];
      if (!upgradePriceId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Upgrade price is not configured",
        });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          metadata: { userId: String(user.id) },
        });
        customerId = customer.id;
        await db
          .update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, user.id));
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: upgradePriceId, quantity: 1 }],
        mode: "payment",
        success_url: `${getOrigin()}/pricing?success=true`,
        cancel_url: `${getOrigin()}/pricing?canceled=true`,
        metadata: {
          userId: String(user.id),
          upgrade: upgradeKey,
        },
        payment_intent_data: {
          metadata: { userId: String(user.id), upgrade: upgradeKey },
        },
      });

      return { url: session.url, applied: false };
    }),

  getBillingPortalUrl: authedQuery.mutation(async ({ ctx }) => {
    const stripe = getStripe();
    if (!stripe) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe is not configured",
      });
    }

    const db = getDb();
    const [user] = await db
      .select({ stripeCustomerId: users.stripeCustomerId })
      .from(users)
      .where(eq(users.id, ctx.user.id));

    if (!user?.stripeCustomerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No Stripe customer found",
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${getOrigin()}/dashboard`,
    });

    return { url: session.url };
  }),
});

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

function getOrigin() {
  return getPublicAppOrigin();
}
