CREATE TABLE "pat_question_instances" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"position" integer NOT NULL,
	"category" varchar NOT NULL,
	"difficulty" varchar NOT NULL,
	"difficulty_band" integer NOT NULL,
	"canonical_question_id" text NOT NULL,
	"public_question" jsonb NOT NULL,
	"private_record" jsonb NOT NULL,
	"user_answer" integer,
	"time_spent" integer DEFAULT 0 NOT NULL,
	"flagged" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pat_question_instances_difficulty_band_range" CHECK ("pat_question_instances"."difficulty_band" BETWEEN 1 AND 5),
	CONSTRAINT "pat_question_instances_answer_range" CHECK ("pat_question_instances"."user_answer" IS NULL OR "pat_question_instances"."user_answer" BETWEEN 0 AND 4),
	CONSTRAINT "pat_question_instances_time_nonnegative" CHECK ("pat_question_instances"."time_spent" >= 0)
);
--> statement-breakpoint
CREATE TABLE "pat_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"mode" varchar NOT NULL,
	"category" varchar,
	"difficulty" varchar NOT NULL,
	"question_count" integer NOT NULL,
	"time_limit_seconds" integer,
	"engine_version" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"deadline_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"abandoned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pat_sessions_question_count_range" CHECK ("pat_sessions"."question_count" BETWEEN 1 AND 90),
	CONSTRAINT "pat_sessions_time_limit_positive" CHECK ("pat_sessions"."time_limit_seconds" IS NULL OR "pat_sessions"."time_limit_seconds" > 0)
);
--> statement-breakpoint
ALTER TABLE "pat_question_instances" ADD CONSTRAINT "pat_question_instances_session_id_pat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pat_sessions" ADD CONSTRAINT "pat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pat_question_instances_session_position_unique" ON "pat_question_instances" USING btree ("session_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "pat_question_instances_session_question_unique" ON "pat_question_instances" USING btree ("session_id","canonical_question_id");--> statement-breakpoint
CREATE INDEX "pat_question_instances_session_idx" ON "pat_question_instances" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "pat_sessions_user_created_idx" ON "pat_sessions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "pat_sessions_one_active_per_user" ON "pat_sessions" USING btree ("user_id") WHERE "pat_sessions"."submitted_at" IS NULL AND "pat_sessions"."abandoned_at" IS NULL;--> statement-breakpoint
DELETE FROM "pat_attempts" AS newer
USING "pat_attempts" AS older
WHERE newer."id" > older."id"
  AND newer."user_id" = older."user_id"
  AND newer."session_id" IS NOT NULL
  AND newer."session_id" = older."session_id"
  AND newer."question_id" = older."question_id";--> statement-breakpoint
CREATE UNIQUE INDEX "pat_attempts_user_session_question_unique" ON "pat_attempts" USING btree ("user_id","session_id","question_id") WHERE "pat_attempts"."session_id" IS NOT NULL;
