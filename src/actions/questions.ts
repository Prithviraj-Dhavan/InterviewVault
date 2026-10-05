"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import {
  companiesTable,
  questionRolesTable,
  questionsTable,
} from "@/db/schema/questions";
import { auth } from "@/lib/auth";
import { createQuestionFormSchema } from "@/lib/zod-schemas";
import { generateObject } from "ai";
import { z } from "zod";
import { groq } from "@ai-sdk/groq";

// The dropdowns use "all" (or an empty value) to mean "nothing selected"
function readOptionalField(
  formData: FormData,
  name: string
): string | undefined {
  const value = formData.get(name);
  if (typeof value === "string" && value !== "" && value !== "all") {
    return value;
  }
  return;
}

type createQuestionResponse =
  | {
      status: "success";
      message: string;
      prevState?: {
        title: string | null;
        description: string | null;
        company: string | null;
        role: string | null;
      };
      data: {
        id: string;
      };
    }
  | {
      status: "failed";
      message: string;
      prevState?: {
        title: string | null;
        description: string | null;
        company: string | null;
        role: string | null;
      };
    };

// TODO: change to a api endpoint later to be able to return http status codes like 400,401
// By default server actions only return 200 and 500 and 404 and be returned using the
// notFound() function from "next/navigation"
export async function createQuestion(
  _: unknown,
  formData: FormData
): Promise<createQuestionResponse> {
  const prevState = {
    title: (formData.get("title") as string | null) ?? null,
    description: (formData.get("description") as string | null) ?? null,
    company: (formData.get("company") as string | null) ?? null,
    role: (formData.get("role") as string | null) ?? null,
  };

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return {
        status: "failed",
        message: "Please log in",
        prevState,
      };
    }

    const parsed = createQuestionFormSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      company: readOptionalField(formData, "company"),
      role: readOptionalField(formData, "role"),
    });

    if (!parsed.success) {
      return {
        status: "failed",
        message: parsed.error.issues[0]?.message ?? "Invalid form data",
        prevState,
      };
    }

    const { title, description, company, role } = parsed.data;

    // AI Spam Check
    const spamCheck = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: z.object({
        isSpam: z.boolean(),
        reason: z.string().optional(),
      }),
      prompt: `You are an automated spam filter for a software engineering interview preparation platform. 
Evaluate the following submitted question to determine if it is spam, gibberish, or completely irrelevant. 
If it is a valid interview question (even if it's simple or poorly formatted), return false. 
If it is random keyboard mashing (e.g., 'asdfasdf'), highly offensive, or a completely irrelevant advertisement, return true.

Title: ${title}
Description: ${description}`,
    });

    if (spamCheck.object.isSpam) {
      return {
        status: "failed",
        message: "Your submission was flagged as invalid or spam. Please ensure it is a real question.",
        prevState,
      };
    }

    // Generate the id here so the question and its role link can be
    // saved together in one batch (a single transaction on Neon HTTP).
    const id = crypto.randomUUID();
    const insertQuestion = db.insert(questionsTable).values({
      id,
      title,
      description,
      companyId: company,
      postedBy: session.session.userId,
    });

    if (role) {
      await db.batch([
        insertQuestion,
        db.insert(questionRolesTable).values({ questionId: id, roleId: role }),
      ]);
    } else {
      await insertQuestion;
    }

    return {
      status: "success",
      message: "Question created successfully",
      data: { id },
    };
  } catch (error) {
    console.error(error);
    return {
      status: "failed",
      message: "Failed to create question",
      prevState,
    };
  }
}

export async function getQuestion(questionId: string) {
  "use server";
  try {
    const [question] = await db
      .select({
        id: questionsTable.id,
        title: questionsTable.title,
        description: questionsTable.description,
        company: companiesTable.name,
        aiAnswer: questionsTable.aiAnswer,
        userName: user.name,
        userImage: user.image,
      })
      .from(questionsTable)
      .leftJoin(companiesTable, eq(companiesTable.id, questionsTable.companyId))
      .leftJoin(user, eq(user.id, questionsTable.postedBy))
      .where(
        and(
          eq(questionsTable.id, questionId),
          eq(questionsTable.isDeleted, false)
        )
      );

    if (!question) {
      return {
        status: "failed",
        reason: "NOT_FOUND",
        message: "Question not found",
        data: null,
      } as const;
    }

    return {
      status: "success",
      message: "Question fetched successfully",
      data: question,
    } as const;
  } catch (error) {
    console.error(error);
    return {
      status: "failed",
      reason: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch question",
      data: null,
    } as const;
  }
}

export async function deleteUserQuestion(questionId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { status: "failed", message: "Unauthorized" };

    const [question] = await db
      .select({ postedBy: questionsTable.postedBy })
      .from(questionsTable)
      .where(eq(questionsTable.id, questionId));

    if (!question || question.postedBy !== session.session.userId) {
      return { status: "failed", message: "Forbidden" };
    }

    await db
      .update(questionsTable)
      .set({ isDeleted: true })
      .where(eq(questionsTable.id, questionId));
      
    return { status: "success" };
  } catch (error) {
    console.error(error);
    return { status: "failed", message: "Internal Error" };
  }
}

export async function updateUserQuestion(
  questionId: string, 
  data: { title: string; description: string; companyId?: string }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { status: "failed", message: "Unauthorized" };

    const [question] = await db
      .select({ postedBy: questionsTable.postedBy })
      .from(questionsTable)
      .where(eq(questionsTable.id, questionId));

    if (!question || question.postedBy !== session.session.userId) {
      return { status: "failed", message: "Forbidden" };
    }

    await db
      .update(questionsTable)
      .set({
        title: data.title,
        description: data.description,
        ...(data.companyId ? { companyId: data.companyId } : {})
      })
      .where(eq(questionsTable.id, questionId));

    return { status: "success" };
  } catch (error) {
    console.error(error);
    return { status: "failed", message: "Internal Error" };
  }
}

export async function reportQuestion(questionId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { status: "failed", message: "Unauthorized" };

    const [question] = await db
      .select({ spamReports: questionsTable.spamReports })
      .from(questionsTable)
      .where(eq(questionsTable.id, questionId));

    if (!question) {
      return { status: "failed", message: "Question not found" };
    }

    const newSpamCount = question.spamReports + 1;

    await db
      .update(questionsTable)
      .set({ 
        spamReports: newSpamCount,
        isDeleted: newSpamCount >= 3 
      })
      .where(eq(questionsTable.id, questionId));

    return { 
      status: "success", 
      message: newSpamCount >= 3 
        ? "Question hidden for administrative review."
        : "Question reported successfully." 
    };
  } catch (error) {
    console.error(error);
    return { status: "failed", message: "Internal Error" };
  }
}
