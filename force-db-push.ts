import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Dropping old tables if they exist...");
  await sql`DROP TABLE IF EXISTS "interview_reports" CASCADE;`;
  await sql`DROP TABLE IF EXISTS "interview_evaluations" CASCADE;`;
  await sql`DROP TABLE IF EXISTS "interview_answers" CASCADE;`;
  await sql`DROP TABLE IF EXISTS "interview_questions" CASCADE;`;
  await sql`DROP TABLE IF EXISTS "interview_plans" CASCADE;`;
  await sql`DROP TABLE IF EXISTS "candidate_profiles" CASCADE;`;
  await sql`DROP TABLE IF EXISTS "interview_turns" CASCADE;`;
  await sql`DROP TABLE IF EXISTS "interview_sessions" CASCADE;`;
  
  console.log("Creating new tables...");
  
  await sql`
    CREATE TABLE "interview_sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
        "company" text NOT NULL,
        "role" text NOT NULL,
        "resume_text" text NOT NULL,
        "jd_text" text NOT NULL,
        "status" text DEFAULT 'INPUT' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
    );
  `;
  
  await sql`
    CREATE TABLE "candidate_profiles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "session_id" uuid NOT NULL REFERENCES "interview_sessions"("id") ON DELETE cascade,
        "level" text NOT NULL,
        "skills" jsonb NOT NULL,
        "gaps" jsonb NOT NULL,
        "raw_llm_json" jsonb
    );
  `;

  await sql`
    CREATE TABLE "interview_plans" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "session_id" uuid NOT NULL REFERENCES "interview_sessions"("id") ON DELETE cascade,
        "topics" jsonb NOT NULL
    );
  `;

  await sql`
    CREATE TABLE "interview_questions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "session_id" uuid NOT NULL REFERENCES "interview_sessions"("id") ON DELETE cascade,
        "topic" text NOT NULL,
        "prompt" text NOT NULL,
        "reason" text NOT NULL,
        "order_index" integer NOT NULL,
        "parent_question_id" uuid,
        "created_at" timestamp DEFAULT now() NOT NULL
    );
  `;

  await sql`
    CREATE TABLE "interview_answers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "question_id" uuid NOT NULL REFERENCES "interview_questions"("id") ON DELETE cascade,
        "content" text NOT NULL,
        "input_mode" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
    );
  `;

  await sql`
    CREATE TABLE "interview_evaluations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "answer_id" uuid NOT NULL REFERENCES "interview_answers"("id") ON DELETE cascade,
        "score" integer NOT NULL,
        "feedback" jsonb NOT NULL,
        "triggered_followup" boolean DEFAULT false NOT NULL
    );
  `;

  await sql`
    CREATE TABLE "interview_reports" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "session_id" uuid NOT NULL REFERENCES "interview_sessions"("id") ON DELETE cascade,
        "overall_score" integer NOT NULL,
        "topic_breakdown" jsonb NOT NULL,
        "summary" text NOT NULL,
        "generated_at" timestamp DEFAULT now() NOT NULL
    );
  `;

  console.log("Done.");
}

main().catch(e => console.error(e));
