ALTER TABLE "users" DROP CONSTRAINT "users_unionId_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "users_provider_union_id_unique" ON "users" USING btree ("provider","unionId");