-- AI Interview Practice: sessions + turns, including resume/JD storage and
-- per-question reason + category (technical/behavioral).
-- Nothing existing is changed. Safe to run more than once.
-- Use this in your database's SQL editor, or via `pnpm exec drizzle-kit push`.

CREATE TABLE IF NOT EXISTS "interview_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "company" text NOT NULL,
  "role" text NOT NULL,
  "resume_text" text NOT NULL DEFAULT '',
  "job_description" text NOT NULL DEFAULT '',
  "status" text NOT NULL DEFAULT 'in_progress',
  "score" integer,
  "feedback" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "interview_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "interview_turns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" uuid NOT NULL,
  "question_text" text NOT NULL,
  "reason" text NOT NULL DEFAULT '',
  "category" text NOT NULL DEFAULT 'behavioral',
  "answer_text" text,
  "order_number" integer NOT NULL,
  CONSTRAINT "interview_turns_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."interview_sessions"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "interview_sessions_created_idx" ON "interview_sessions" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "interview_turns_session_id_idx" ON "interview_turns" USING btree ("session_id");

-- If you already ran an older version of this migration (tables exist but
-- are missing the newer columns), these ALTERs backfill them safely:
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "resume_text" text NOT NULL DEFAULT '';
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "job_description" text NOT NULL DEFAULT '';
ALTER TABLE "interview_turns" ADD COLUMN IF NOT EXISTS "reason" text NOT NULL DEFAULT '';
ALTER TABLE "interview_turns" ADD COLUMN IF NOT EXISTS "category" text NOT NULL DEFAULT 'behavioral';
