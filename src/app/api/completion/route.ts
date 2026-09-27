import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { questionsTable } from "@/db/schema/questions";
import { auth } from "@/lib/auth";
import { completionsSchema } from "@/lib/zod-schemas";

export const maxDuration = 30;

export async function POST(req: Request) {
  // Only signed-in users may spend AI credits
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("Please log in", { status: 401 });
  }

  const rawBody = await req.json().catch(() => null);
  const validatedBody = completionsSchema.safeParse(rawBody);

  if (!validatedBody.success) {
    return new Response("Invalid request body", { status: 400 });
  }

  const { questionId } = validatedBody.data;

  // Read the question from the database instead of trusting text sent by the browser
  const [question] = await db
    .select({
      title: questionsTable.title,
      description: questionsTable.description,
      aiAnswer: questionsTable.aiAnswer,
    })
    .from(questionsTable)
    .where(
      and(
        eq(questionsTable.id, questionId),
        eq(questionsTable.isDeleted, false)
      )
    );

  if (!question) {
    return new Response("Question not found", { status: 404 });
  }

  // One AI answer per question: stops repeat clicks from burning credits
  if (question.aiAnswer) {
    return new Response("An AI answer already exists for this question", {
      status: 409,
    });
  }

  const result = streamText({
    model: groq("openai/gpt-oss-120b"),
    system:
      "Answer this interview question as if you are the interviewee and give an ideal answer. Be clear, well structured and concise. Do not mention that you are an AI and do not add unrelated commentary.",
    prompt: `Title: ${question.title}\n\nContent: ${question.description}`,
    onFinish: async ({ text }) => {
      // Only fill it in if nobody else saved an answer in the meantime
      await db
        .update(questionsTable)
        .set({ aiAnswer: text })
        .where(
          and(
            eq(questionsTable.id, questionId),
            isNull(questionsTable.aiAnswer)
          )
        );
    },
  });

  return result.toUIMessageStreamResponse();
}
