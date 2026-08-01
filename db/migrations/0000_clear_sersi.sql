CREATE TABLE "community_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"school" text,
	"program" text,
	"result" varchar,
	"gpa" text,
	"dat_aa" text,
	"dat_pat" text,
	"province" varchar,
	"likes" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"hidden_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer,
	"comment_id" integer,
	"reporter_id" integer NOT NULL,
	"reason" text NOT NULL,
	"description" text,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "dat_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"is_correct" boolean NOT NULL,
	"time_spent" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dat_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"subject" varchar NOT NULL,
	"topic" text NOT NULL,
	"difficulty" varchar NOT NULL,
	"question_text" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_answer" integer NOT NULL,
	"explanation" text NOT NULL,
	"source" varchar DEFAULT 'curated' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dat_questions_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"read" boolean DEFAULT false NOT NULL,
	"email_sent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pat_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"category" text NOT NULL,
	"difficulty" varchar NOT NULL,
	"question_id" text NOT NULL,
	"user_answer" integer,
	"is_correct" boolean,
	"time_spent" integer,
	"session_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pat_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"category" varchar NOT NULL,
	"difficulty" varchar NOT NULL,
	"source" varchar DEFAULT 'curated' NOT NULL,
	"question_data" jsonb NOT NULL,
	"correct_answer" integer NOT NULL,
	"explanation_l1" text NOT NULL,
	"explanation_l2" text NOT NULL,
	"explanation_l3" text NOT NULL,
	"concepts" jsonb NOT NULL,
	"time_target" integer NOT NULL,
	"correct_rate" real,
	"avg_time" real,
	"times_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pat_questions_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"first_name" text,
	"last_name" text,
	"province" text,
	"current_gpa" text,
	"gpa_scale" varchar DEFAULT '4.0',
	"year_level" integer,
	"target_year" integer,
	"degree_status" varchar DEFAULT 'in_progress',
	"undergrad_school" text,
	"dat_test_date" timestamp,
	"target_schools" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "pushSubscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"year" integer NOT NULL,
	"avg_gpa" real,
	"avg_dat_aa" real,
	"avg_dat_pat" real,
	"avg_dat_rc" real,
	"interview_rate" real,
	"offer_rate" real,
	"ip_acceptance_rate" real,
	"oop_acceptance_rate" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"category" varchar DEFAULT 'other' NOT NULL,
	"due_date" timestamp,
	"status" varchar DEFAULT 'not_started' NOT NULL,
	"priority" varchar DEFAULT 'medium' NOT NULL,
	"school_id" text,
	"notes" text,
	"estimatedMinutes" integer,
	"rescheduledFrom" timestamp,
	"completed_at" timestamp,
	"due_notified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" varchar DEFAULT 'google' NOT NULL,
	"unionId" text NOT NULL,
	"name" text,
	"email" text,
	"avatar" text,
	"role" varchar DEFAULT 'user' NOT NULL,
	"tier" varchar DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"premium_until" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignInAt" timestamp DEFAULT now() NOT NULL,
	"email_task_due" boolean DEFAULT true NOT NULL,
	"email_study_reminder" boolean DEFAULT true NOT NULL,
	"email_community" boolean DEFAULT true NOT NULL,
	CONSTRAINT "users_unionId_unique" UNIQUE("unionId")
);
--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_comment_id_community_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."community_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pushSubscriptions" ADD CONSTRAINT "pushSubscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;