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
