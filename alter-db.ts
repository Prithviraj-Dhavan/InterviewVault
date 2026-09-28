import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Altering interview_sessions...");
  try {
    await sql`ALTER TABLE interview_sessions ADD COLUMN candidate_profile TEXT`;
    console.log("Added candidate_profile");
  } catch (e: any) {
    console.log("candidate_profile might exist:", e.message);
  }
  try {
    await sql`ALTER TABLE interview_sessions ADD COLUMN interview_plan TEXT`;
    console.log("Added interview_plan");
  } catch (e: any) {
    console.log("interview_plan might exist:", e.message);
  }

  console.log("Altering interview_turns...");
  try {
    await sql`ALTER TABLE interview_turns ADD COLUMN is_follow_up BOOLEAN NOT NULL DEFAULT false`;
    console.log("Added is_follow_up");
  } catch (e: any) {
    console.log("is_follow_up might exist:", e.message);
  }
  try {
    await sql`ALTER TABLE interview_turns ADD COLUMN score INTEGER`;
    console.log("Added score");
  } catch (e: any) {
    console.log("score might exist:", e.message);
  }
  try {
    await sql`ALTER TABLE interview_turns ADD COLUMN evaluation_feedback TEXT`;
    console.log("Added evaluation_feedback");
  } catch (e: any) {
    console.log("evaluation_feedback might exist:", e.message);
  }
  console.log("Done");
}

main();
