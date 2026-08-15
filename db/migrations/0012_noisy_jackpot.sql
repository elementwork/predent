ALTER TABLE "users" ADD COLUMN "stripe_price_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_subscription_status" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_lifetime_payment_intent_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "users_stripe_lifetime_payment_intent_unique" ON "users" USING btree ("stripe_lifetime_payment_intent_id") WHERE "users"."stripe_lifetime_payment_intent_id" is not null;