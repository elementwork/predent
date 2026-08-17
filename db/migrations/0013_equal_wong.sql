DROP INDEX "users_stripe_lifetime_payment_intent_unique";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "stripe_lifetime_payment_intent_id";