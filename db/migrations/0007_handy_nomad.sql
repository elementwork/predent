DROP TABLE "pat_questions" CASCADE;--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ADD COLUMN "category" varchar;--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ADD COLUMN "difficulty" varchar;