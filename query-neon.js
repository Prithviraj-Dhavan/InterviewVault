const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

async function run() {
  const result = await sql`SELECT id FROM interview_sessions WHERE status='PLANNING' LIMIT 1`;
  if (result.length > 0) {
    console.log("SESSION_ID:", result[0].id);
    const sessionId = result[0].id;
    // let's fetch the plan too
    const planResult = await sql`SELECT topics FROM interview_plans WHERE session_id=${sessionId}`;
    console.log("PLAN:", JSON.stringify(planResult[0]?.topics, null, 2));
  } else {
    console.log("No session found in PLANNING state");
  }
}
run().catch(console.error);
