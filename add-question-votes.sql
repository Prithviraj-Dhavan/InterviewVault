-- "I was asked this too" feature: adds ONE new table. Nothing existing is changed.
-- Use this in the Neon SQL Editor if you prefer it over `pnpm exec drizzle-kit push`.
-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS "question_votes" (
  "question_id" uuid NOT NULL,
  "user_id" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "question_votes_question_id_user_id_pk" PRIMARY KEY ("question_id", "user_id"),
  CONSTRAINT "question_votes_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "question_votes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "question_votes_created_idx" ON "question_votes" USING btree ("created_at");
