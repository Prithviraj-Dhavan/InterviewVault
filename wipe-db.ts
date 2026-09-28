import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Dropping tables...");
  try {
    await sql`DROP TABLE IF EXISTS interview_turns CASCADE`;
    await sql`DROP TABLE IF EXISTS interview_sessions CASCADE`;
    console.log("Dropped tables.");
  } catch (e: any) {
    console.error("Error dropping tables:", e.message);
  }
  console.log("Done");
}

main();
