import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { companiesTable, questionsTable } from "@/db/schema/questions";
import { questionVotesTable } from "@/db/schema/votes";
import { baseProcedure, createTRPCRouter, privateProcedure } from "../init";

const MAX_QUESTION_IDS = 50;
const MAX_TOP_LIMIT = 10;
const DEFAULT_TOP_LIMIT = 5;
const DAY_IN_MS = 86_400_000;
const WINDOW_DAYS = { week: 7, month: 30 } as const;

const summaryInput = z.object({
  questionIds: z.array(z.uuid()).max(MAX_QUESTION_IDS),
});

const setInput = z.object({
  questionId: z.uuid(),
  voted: z.boolean(),
});

const topInput = z.object({
  window: z.enum(["week", "month", "all"]).default("all"),
  limit: z.number().int().min(1).max(MAX_TOP_LIMIT).default(DEFAULT_TOP_LIMIT),
});

export type VoteSummary = { votes: number; voted: boolean };

export const votesRouter = createTRPCRouter({
  /**
   * Vote counts (and whether the current user voted) for many questions in
   * ONE grouped query, so a page of cards needs a single request.
   */
  summary: baseProcedure
    .input(summaryInput)
    .query(async ({ ctx, input }): Promise<Record<string, VoteSummary>> => {
      const result: Record<string, VoteSummary> = {};
      for (const id of input.questionIds) {
        result[id] = { votes: 0, voted: false };
      }
      if (input.questionIds.length === 0) {
        return result;
      }

      const userId = ctx.session?.userId ?? null;

      try {
        const rows = await db
          .select({
            questionId: questionVotesTable.questionId,
            votes: count(),
            voted: userId
              ? sql<boolean>`coalesce(bool_or(${questionVotesTable.userId} = ${userId}), false)`
              : sql<boolean>`false`,
          })
          .from(questionVotesTable)
          .where(inArray(questionVotesTable.questionId, input.questionIds))
          .groupBy(questionVotesTable.questionId);

        for (const row of rows) {
          result[row.questionId] = { votes: row.votes, voted: row.voted };
        }
        return result;
      } catch (err) {
        console.error("Error fetching vote summary:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch votes",
          cause: err,
        });
      }
    }),

  /**
   * Set (not toggle) the current user's mark. Because it is idempotent,
   * double clicks, retries and out-of-order requests cannot corrupt counts.
   */
  set: privateProcedure
    .input(setInput)
    .mutation(async ({ ctx, input }): Promise<VoteSummary> => {
      const userId = ctx.session.userId;

      try {
        const [question] = await db
          .select({ id: questionsTable.id })
          .from(questionsTable)
          .where(
            and(
              eq(questionsTable.id, input.questionId),
              eq(questionsTable.isDeleted, false)
            )
          );

        if (!question) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Question not found",
          });
        }

        if (input.voted) {
          await db
            .insert(questionVotesTable)
            .values({ questionId: input.questionId, userId })
            .onConflictDoNothing();
        } else {
          await db
            .delete(questionVotesTable)
            .where(
              and(
                eq(questionVotesTable.questionId, input.questionId),
                eq(questionVotesTable.userId, userId)
              )
            );
        }

        const [row] = await db
          .select({ votes: count() })
          .from(questionVotesTable)
          .where(eq(questionVotesTable.questionId, input.questionId));

        return { votes: row?.votes ?? 0, voted: input.voted };
      } catch (err) {
        if (err instanceof TRPCError) {
          throw err;
        }
        console.error("Error saving vote:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save your vote",
          cause: err,
        });
      }
    }),

  /** Most asked questions, optionally limited to the last 7 or 30 days. */
  top: baseProcedure.input(topInput).query(async ({ input }) => {
    const since =
      input.window === "all"
        ? undefined
        : new Date(Date.now() - WINDOW_DAYS[input.window] * DAY_IN_MS);

    try {
      return await db
        .select({
          id: questionsTable.id,
          title: questionsTable.title,
          companyName: companiesTable.name,
          votes: count(),
        })
        .from(questionVotesTable)
        .innerJoin(
          questionsTable,
          eq(questionsTable.id, questionVotesTable.questionId)
        )
        .leftJoin(
          companiesTable,
          eq(companiesTable.id, questionsTable.companyId)
        )
        .where(
          and(
            eq(questionsTable.isDeleted, false),
            since ? gte(questionVotesTable.createdAt, since) : undefined
          )
        )
        .groupBy(questionsTable.id, companiesTable.id)
        .orderBy(desc(count()), desc(questionsTable.createdAt))
        .limit(input.limit);
    } catch (err) {
      console.error("Error fetching top questions:", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch most asked questions",
        cause: err,
      });
    }
  }),
});
