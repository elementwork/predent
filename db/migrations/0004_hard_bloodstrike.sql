CREATE TABLE "interview_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"format" varchar NOT NULL,
	"category" text NOT NULL,
	"question" text NOT NULL,
	"model_answer" text,
	"frequency" integer,
	"school_id" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interview_questions_public_id_unique" UNIQUE("public_id")
);
