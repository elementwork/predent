CREATE TABLE "stripe_webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"type" text NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stripe_webhook_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dat_attempts" ADD CONSTRAINT "dat_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dat_attempts" ADD CONSTRAINT "dat_attempts_question_id_dat_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."dat_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pat_attempts" ADD CONSTRAINT "pat_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "community_posts_user_id_idx" ON "community_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "community_posts_type_idx" ON "community_posts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "community_posts_deleted_at_idx" ON "community_posts" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "community_posts_hidden_at_idx" ON "community_posts" USING btree ("hidden_at");--> statement-breakpoint
CREATE INDEX "dat_attempts_user_id_idx" ON "dat_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dat_attempts_created_at_idx" ON "dat_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pat_attempts_user_id_idx" ON "pat_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pat_attempts_category_idx" ON "pat_attempts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "pat_attempts_created_at_idx" ON "pat_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "profiles_user_id_idx" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tasks_user_id_idx" ON "tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");