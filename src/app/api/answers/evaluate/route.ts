import { groq } from "@ai-sdk/groq";
import { streamObject } from "ai";
import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { answersTable, questionsTable } from "@/db/schema/questions";
import { auth } from "@/lib/auth";
import { aiEvaluationSchema, evaluateAnswerSchema } from "@/lib/zod-schemas";

export const maxDuration = 30;

export async function POST(req: Request) {
  // Only signed-in users may spend AI credits
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("Please log in", { status: 401 });
  }

  const rawBody = await req.json().catch(() => null);
  const validatedBody = evaluateAnswerSchema.safeParse(rawBody);

  if (!validatedBody.success) {
    return new Response("Invalid request body", { status: 400 });
  }

  const { answerId } = validatedBody.data;

  // Read the question and answer from the database instead of trusting
  // text sent by the browser
  const [row] = await db
    .select({
      answer: answersTable.content,
      aiEvaluation: answersTable.aiEvaluation,
      title: questionsTable.title,
      description: questionsTable.description,
    })
    .from(answersTable)
    .innerJoin(questionsTable, eq(questionsTable.id, answersTable.questionId))
    .where(
      and(eq(answersTable.id, answerId), eq(answersTable.isDeleted, false))
    );

  if (!row) {
    return new Response("Answer not found", { status: 404 });
  }

  // One evaluation per answer: stops repeat clicks from burning credits
  if (row.aiEvaluation) {
    return new Response("This answer has already been evaluated", {
      status: 409,
    });
  }

  const result = streamObject({
    model: groq("openai/gpt-oss-120b"),
    schema: aiEvaluationSchema,
    messages: [
      {
        role: "system",
        content:
          "Evaluate the answer to the question based on the following criteria: clarity, accuracy, relevance, and completeness.",
      },
      {
        role: "user",
        content: `Question: ${row.title}\n\n${row.description}\n\nAnswer: ${row.answer}`,
      },
    ],
    onFinish: async ({ object, error }) => {
      if (!error) {
        await db
          .update(answersTable)
          .set({
            aiEvaluation: object,
          })
          .where(
            and(
              eq(answersTable.id, answerId),
              isNull(answersTable.aiEvaluation)
            )
          );
      }
    },
  });

  return result.toTextStreamResponse();
}
