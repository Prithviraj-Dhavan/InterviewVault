import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const interviewSessions = pgTable("interview_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  // Resume text extracted from the uploaded PDF, and the pasted job description.
  // Both feed every question-generation and the final scorecard prompt.
  resumeText: text("resume_text").notNull(),
  jobDescription: text("job_description").notNull(),
  status: text("status").notNull().default("in_progress"), // 'in_progress' | 'completed'
  score: integer("score"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewTurns = pgTable("interview_turns", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  // Why the AI asked this particular question (shown next to the question).
  reason: text("reason").notNull(),
  // 'technical' | 'behavioral' — used to keep the session a genuine mixture.
  category: text("category").notNull(),
  answerText: text("answer_text"),
  orderNumber: integer("order_number").notNull(),
});
