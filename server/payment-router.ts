import { z } from "zod";
import Stripe from "stripe";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { getPlanPrices, getStripe } from "./lib/stripe";
import { getPublicAppOrigin } from "./lib/origin";

const priceSchema = z.enum([
  "premium_monthly",
  "premium_yearly",
  "plus_lifetime",
]);

export const paymentRouter = createRouter({
  createCheckoutSession: authedQuery
    .input(z.object({ plan: priceSchema }))
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

      const mode: Stripe.Checkout.SessionCreateParams.Mode =
        input.plan === "plus_lifetime" ? "payment" : "subscription";

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

function getOrigin() {
  return getPublicAppOrigin();
}
