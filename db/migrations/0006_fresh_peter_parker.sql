CREATE TABLE "flashcard_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"source" varchar NOT NULL,
	"question_id" integer NOT NULL,
	"ease_factor" real DEFAULT 2.5 NOT NULL,
	"interval" integer DEFAULT 0 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"next_review" timestamp DEFAULT now() NOT NULL,
	"last_review" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"source" varchar NOT NULL,
	"question_id" integer NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_questions" ADD CONSTRAINT "saved_questions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "flashcard_reviews_user_id_idx" ON "flashcard_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "flashcard_reviews_next_review_idx" ON "flashcard_reviews" USING btree ("next_review");--> statement-breakpoint
CREATE INDEX "saved_questions_user_id_idx" ON "saved_questions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_questions_source_idx" ON "saved_questions" USING btree ("source");