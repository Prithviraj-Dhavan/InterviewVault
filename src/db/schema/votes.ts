import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { questionsTable } from "./questions";

/**
 * "I was asked this too" marks.
 * One row per (question, user): the composite primary key makes a second
 * mark from the same user impossible, so voting is idempotent by design.
 */
export const questionVotesTable = pgTable(
  "question_votes",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => questionsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.questionId, t.userId] }),
    // used by the "most asked this week / month" ranking
    index("question_votes_created_idx").on(t.createdAt),
  ]
);

export type QuestionVote = typeof questionVotesTable.$inferSelect;
