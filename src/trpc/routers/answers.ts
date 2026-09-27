import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { answersTable } from "@/db/schema/questions";
import { answerSchema } from "@/lib/zod-schemas";
import { baseProcedure, createTRPCRouter, privateProcedure } from "../init";

export const answersRouter = createTRPCRouter({
  get: baseProcedure
    .input(
      z.object({
        questionId: z.uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        const answers = await db
          .select({
            id: answersTable.id,
            content: answersTable.content,
            createdAt: answersTable.createdAt,
            userName: user.name,
            userImage: user.image,
            aiEvaluation: answersTable.aiEvaluation,
          })
          .from(answersTable)
          .leftJoin(user, eq(user.id, answersTable.userId))
          .where(
            and(
              eq(answersTable.questionId, input.questionId),
              eq(answersTable.isDeleted, false)
            )
          )
          .orderBy(asc(answersTable.createdAt));

        return {
          status: "success",
          message: "Answers fetched successfully",
          data: answers,
        } as const;
      } catch (err) {
        console.error("Failed to fetch answers", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch answers",
          cause: err,
        });
      }
    }),
  create: privateProcedure
    .input(answerSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const answer = await db
          .insert(answersTable)
          .values({
            questionId: input.questionId,
            content: input.content,
            userId: ctx.session.userId,
          })
          .returning({
            id: answersTable.id,
            name: answersTable.content,
            createdAt: answersTable.createdAt,
          });

        return {
          status: "success",
          message: "Answer created successfully",
          data: answer,
        } as const;
      } catch (err) {
        console.error("Failed to create answer", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create answer",
          cause: err,
        });
      }
    }),
});
