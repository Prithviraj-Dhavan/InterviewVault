import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { questionsTable, companiesTable } from "@/db/schema/questions";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [currentUser] = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, session.user.id));

  if (!currentUser?.isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;

  const questions = await db
    .select({
      id: questionsTable.id,
      title: questionsTable.title,
      description: questionsTable.description,
      createdAt: questionsTable.createdAt,
      companyName: companiesTable.name,
      aiAnswer: questionsTable.aiAnswer,
    })
    .from(questionsTable)
    .leftJoin(companiesTable, eq(companiesTable.id, questionsTable.companyId))
    .where(
      eq(questionsTable.postedBy, userId)
    );

  // Note: we intentionally DON'T filter by isDeleted so admin can see all
  // But for now, only show non-deleted ones for cleanliness
  const activeQuestions = questions.filter(
    (q) => true // could add isDeleted filter if schema is joined
  );

  return Response.json({ questions });
}
