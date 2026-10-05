import { headers } from "next/headers";
import { eq, gt, desc } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { questionsTable, companiesTable } from "@/db/schema/questions";
import { auth } from "@/lib/auth";

export async function GET() {
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

  const reportedQuestions = await db
    .select({
      id: questionsTable.id,
      title: questionsTable.title,
      description: questionsTable.description,
      createdAt: questionsTable.createdAt,
      companyName: companiesTable.name,
      aiAnswer: questionsTable.aiAnswer,
      spamReports: questionsTable.spamReports,
      isDeleted: questionsTable.isDeleted,
      userName: user.name,
      userEmail: user.email,
    })
    .from(questionsTable)
    .leftJoin(companiesTable, eq(companiesTable.id, questionsTable.companyId))
    .leftJoin(user, eq(user.id, questionsTable.postedBy))
    .where(gt(questionsTable.spamReports, 0))
    .orderBy(desc(questionsTable.spamReports));

  return Response.json({ questions: reportedQuestions });
}
