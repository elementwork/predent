SET TIME ZONE 'UTC';--> statement-breakpoint
CREATE TABLE "community_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar DEFAULT 'like' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"idempotency_key" text NOT NULL,
	"topic" varchar NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_at" timestamp with time zone,
	"processed_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outbox_jobs_attempts_nonnegative" CHECK ("outbox_jobs"."attempts" >= 0)
);
--> statement-breakpoint
ALTER TABLE "admin_actions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "admin_actions" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "community_comments" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "community_comments" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "community_posts" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "community_posts" ALTER COLUMN "hidden_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "community_posts" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "community_posts" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "community_posts" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "community_posts" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "community_reports" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "community_reports" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "community_reports" ALTER COLUMN "reviewed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "dat_attempts" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "dat_attempts" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "dat_questions" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "dat_questions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "dat_questions" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ALTER COLUMN "next_review" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ALTER COLUMN "next_review" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ALTER COLUMN "last_review" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ALTER COLUMN "last_review" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "interview_questions" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "interview_questions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "interview_questions" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "pat_attempts" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pat_attempts" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "dat_test_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "pushSubscriptions" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pushSubscriptions" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "saved_questions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "saved_questions" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "school_stats" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "school_stats" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "stripe_webhook_events" ALTER COLUMN "processed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "stripe_webhook_events" ALTER COLUMN "processed_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "due_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "rescheduledFrom" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "completed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "due_notified_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "premium_until" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "stripe_entitlement_updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "lastSignInAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "lastSignInAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone" text DEFAULT 'America/Toronto' NOT NULL;--> statement-breakpoint
ALTER TABLE "community_reactions" ADD CONSTRAINT "community_reactions_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_reactions" ADD CONSTRAINT "community_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DELETE FROM "community_reports" WHERE ("post_id" IS NULL AND "comment_id" IS NULL);--> statement-breakpoint
UPDATE "community_reports" SET "comment_id" = NULL WHERE "post_id" IS NOT NULL AND "comment_id" IS NOT NULL;--> statement-breakpoint
DELETE FROM "community_reports" a USING "community_reports" b WHERE a."id" < b."id" AND a."reporter_id" = b."reporter_id" AND (a."post_id" = b."post_id" OR a."comment_id" = b."comment_id");--> statement-breakpoint
DELETE FROM "pushSubscriptions" a USING "pushSubscriptions" b WHERE a."id" < b."id" AND a."endpoint" = b."endpoint";--> statement-breakpoint
DELETE FROM "saved_questions" a USING "saved_questions" b WHERE a."id" < b."id" AND a."user_id" = b."user_id" AND a."source" = b."source" AND a."question_id" = b."question_id";--> statement-breakpoint
DELETE FROM "flashcard_reviews" a USING "flashcard_reviews" b WHERE a."id" < b."id" AND a."user_id" = b."user_id" AND a."source" = b."source" AND a."question_id" = b."question_id";--> statement-breakpoint
DELETE FROM "school_stats" a USING "school_stats" b WHERE a."id" < b."id" AND a."school_id" = b."school_id" AND a."year" = b."year";--> statement-breakpoint
UPDATE "pat_attempts" SET "user_answer" = NULL WHERE "user_answer" NOT BETWEEN 0 AND 4;--> statement-breakpoint
UPDATE "pat_attempts" SET "time_spent" = 0 WHERE "time_spent" < 0;--> statement-breakpoint
UPDATE "dat_attempts" SET "time_spent" = 0 WHERE "time_spent" < 0;--> statement-breakpoint
UPDATE "tasks" SET "estimatedMinutes" = NULL WHERE "estimatedMinutes" <= 0;--> statement-breakpoint
UPDATE "flashcard_reviews" SET "interval" = 0 WHERE "interval" < 0;--> statement-breakpoint
UPDATE "flashcard_reviews" SET "repetitions" = 0 WHERE "repetitions" < 0;--> statement-breakpoint
CREATE UNIQUE INDEX "community_reactions_user_post_unique" ON "community_reactions" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE INDEX "community_reactions_post_idx" ON "community_reactions" USING btree ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "outbox_jobs_idempotency_key_unique" ON "outbox_jobs" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "outbox_jobs_status_available_idx" ON "outbox_jobs" USING btree ("status","available_at");--> statement-breakpoint
CREATE INDEX "community_comments_post_created_idx" ON "community_comments" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE INDEX "community_posts_visible_created_idx" ON "community_posts" USING btree ("created_at","id") WHERE "community_posts"."deleted_at" IS NULL AND "community_posts"."hidden_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "community_reports_reporter_post_unique" ON "community_reports" USING btree ("reporter_id","post_id") WHERE "community_reports"."post_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "community_reports_reporter_comment_unique" ON "community_reports" USING btree ("reporter_id","comment_id") WHERE "community_reports"."comment_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "dat_attempts_user_created_idx" ON "dat_attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "flashcard_reviews_user_source_question_unique" ON "flashcard_reviews" USING btree ("user_id","source","question_id");--> statement-breakpoint
CREATE INDEX "notifications_user_read_created_idx" ON "notifications" USING btree ("user_id","read","created_at");--> statement-breakpoint
CREATE INDEX "pat_attempts_user_created_idx" ON "pat_attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "pat_attempts_user_category_created_idx" ON "pat_attempts" USING btree ("user_id","category","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "push_subscriptions_endpoint_unique" ON "pushSubscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_questions_user_source_question_unique" ON "saved_questions" USING btree ("user_id","source","question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "school_stats_school_year_unique" ON "school_stats" USING btree ("school_id","year");--> statement-breakpoint
CREATE INDEX "tasks_user_status_due_idx" ON "tasks" USING btree ("user_id","status","due_date");--> statement-breakpoint
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_exactly_one_target" CHECK (num_nonnulls("community_reports"."post_id", "community_reports"."comment_id") = 1);--> statement-breakpoint
ALTER TABLE "dat_attempts" ADD CONSTRAINT "dat_attempts_time_nonnegative" CHECK ("dat_attempts"."time_spent" IS NULL OR "dat_attempts"."time_spent" >= 0);--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_interval_nonnegative" CHECK ("flashcard_reviews"."interval" >= 0);--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_repetitions_nonnegative" CHECK ("flashcard_reviews"."repetitions" >= 0);--> statement-breakpoint
ALTER TABLE "pat_attempts" ADD CONSTRAINT "pat_attempts_answer_range" CHECK ("pat_attempts"."user_answer" IS NULL OR "pat_attempts"."user_answer" BETWEEN 0 AND 4);--> statement-breakpoint
ALTER TABLE "pat_attempts" ADD CONSTRAINT "pat_attempts_time_nonnegative" CHECK ("pat_attempts"."time_spent" IS NULL OR "pat_attempts"."time_spent" >= 0);--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_estimated_minutes_positive" CHECK ("tasks"."estimatedMinutes" IS NULL OR "tasks"."estimatedMinutes" > 0);
