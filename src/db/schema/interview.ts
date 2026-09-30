import { integer, pgTable, text, timestamp, uuid, boolean, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { z } from "zod";

export const interviewSessions = pgTable("interview_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  resumeText: text("resume_text").notNull(),
  jdText: text("jd_text").notNull(),
  status: text("status").notNull().default("INPUT"), // INPUT | ANALYSIS | PLANNING | INTERVIEW_LOOP | REPORT
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const candidateProfiles = pgTable("candidate_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  level: text("level").notNull(),
  skills: jsonb("skills").notNull(), // string[]
  gaps: jsonb("gaps").notNull(), // string[]
  rawLlmJson: jsonb("raw_llm_json"),
});

export const interviewPlans = pgTable("interview_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  topics: jsonb("topics").notNull(), // { topic: string, weight: number, question_count: number }[]
});

export const interviewQuestions = pgTable("interview_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  prompt: text("prompt").notNull(),
  reason: text("reason").notNull(),
  orderIndex: integer("order_index").notNull(),
  parentQuestionId: uuid("parent_question_id"), // for follow-ups
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewAnswers = pgTable("interview_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => interviewQuestions.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  inputMode: text("input_mode").notNull(), // text | voice | sketch
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewEvaluations = pgTable("interview_evaluations", {
  id: uuid("id").primaryKey().defaultRandom(),
  answerId: uuid("answer_id")
    .notNull()
    .references(() => interviewAnswers.id, { onDelete: "cascade" }),
  score: integer("score").notNull(), // 1-5
  feedback: jsonb("feedback").notNull(), // { strengths: string[], gaps: string[] }
  triggeredFollowup: boolean("triggered_followup").notNull().default(false),
});

export const interviewReports = pgTable("interview_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  overallScore: integer("overall_score").notNull(),
  topicBreakdown: jsonb("topic_breakdown").notNull(),
  summary: text("summary").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const interviewTurns = pgTable("interview_turns", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  reason: text("reason").notNull(),
  category: text("category").notNull(), // "technical" | "behavioral"
  orderNumber: integer("order_number").notNull(),
  isFollowUp: boolean("is_follow_up").notNull().default(false),
  answerText: text("answer_text"),
  score: integer("score"),                     // 1-5
  evaluationFeedback: jsonb("evaluation_feedback"), // { strengths: string[], gaps: string[] }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
