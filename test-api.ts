import { db } from "./src/db";
import { interviewSessions } from "./src/db/schema/interview";
import { generateNextQuestion } from "./src/lib/interview/services";
import { eq } from "drizzle-orm";

async function run() {
  const session = await db.query.interviewSessions.findFirst({
    where: eq(interviewSessions.status, "PLANNING")
  });
  if (!session) {
    console.log("No session in PLANNING state");
    return;
  }
  console.log("Found session", session.id);
  try {
    const q = await generateNextQuestion(session.id);
    console.log("Generated question:", q);
  } catch (e) {
    console.error("Error generating question:", e);
  }
  process.exit(0);
}
run();
