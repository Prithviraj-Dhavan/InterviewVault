import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  json,
  pgTable,
  // biome-ignore lint/nursery/noDeprecatedImports: primaryKey is deprecated, but currently required for composite primary keys in Drizzle ORM. No non-deprecated alternative available as of June 2024. See https://github.com/drizzle-team/drizzle-orm/issues/617
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { AIEvaluation } from "@/lib/zod-schemas";
import { user } from "./auth";

export const questionsTable = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    aiAnswer: text("ai_answer"),
    companyId: uuid("company_id").references(() => companiesTable.id, {
      onDelete: "set null",
    }),
    postedBy: text("posted_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
  },
  (t) => [
    index("company_idx").on(t.companyId),
    index("title_search_index").using(
      "gin",
      sql`to_tsvector('english', ${t.title})`
    ),
  ]
);

export type Question = typeof questionsTable.$inferSelect;
export type QuestionInsert = typeof questionsTable.$inferInsert;

export const answersTable = pgTable(
  "answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questionsTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    aiEvaluation: json().$type<AIEvaluation>(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
  },
  (t) => [index("question_idx").on(t.questionId)]
);

export type Answer = typeof answersTable.$inferSelect;
export type AnswerInsert = typeof answersTable.$inferInsert;

// tables for filtering
export const companiesTable = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  website: text("website"),
});

export type Company = typeof companiesTable.$inferSelect;
export type CompanyInsert = typeof companiesTable.$inferInsert;

export const rolesTable = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
});

export type Role = typeof rolesTable.$inferSelect;
export type RoleInsert = typeof rolesTable.$inferInsert;

export const tagsTable = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
});

export type Tag = typeof tagsTable.$inferSelect;
export type TagInsert = typeof tagsTable.$inferInsert;

export const questionTagsTable = pgTable(
  "question_tags",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => questionsTable.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tagsTable.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.questionId, t.tagId] })]
);

export const questionRolesTable = pgTable(
  "question_roles",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => questionsTable.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => rolesTable.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.questionId, t.roleId] })]
);

// TODO: add groups or organisations
