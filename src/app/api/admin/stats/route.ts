import { headers } from "next/headers";
import { count, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { user, session as sessionTable } from "@/db/schema/auth";
import { questionsTable } from "@/db/schema/questions";
import { interviewSessions } from "@/db/schema/interview";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the full user record to check isAdmin
  const [currentUser] = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, session.user.id));

  if (!currentUser?.isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // --- Date helpers ---
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - 6); // last 7 days

  // --- Platform-wide Stats (all in parallel) ---
  const [
    [totalUsers],
    [totalQuestions],
    [totalInterviews],
    [loginsToday],
    [loginsThisWeek],
  ] = await Promise.all([
    db.select({ count: count() }).from(user),
    db
      .select({ count: count() })
      .from(questionsTable)
      .where(eq(questionsTable.isDeleted, false)),
    db.select({ count: count() }).from(interviewSessions),
    // Distinct users who started a session TODAY
    db
      .select({ count: sql<number>`cast(count(distinct ${sessionTable.userId}) as int)` })
      .from(sessionTable)
      .where(gte(sessionTable.createdAt, startOfToday)),
    // Distinct users who started a session in the last 7 days
    db
      .select({ count: sql<number>`cast(count(distinct ${sessionTable.userId}) as int)` })
      .from(sessionTable)
      .where(gte(sessionTable.createdAt, startOfWeek)),
  ]);

  // --- Per-user breakdown: user info + question count ---
  const usersWithStats = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      questionCount: sql<number>`cast(count(${questionsTable.id}) as int)`,
    })
    .from(user)
    .leftJoin(
      questionsTable,
      sql`${questionsTable.postedBy} = ${user.id} AND ${questionsTable.isDeleted} = false`
    )
    .groupBy(user.id, user.name, user.email, user.image, user.createdAt)
    .orderBy(sql`count(${questionsTable.id}) desc`);

  return Response.json({
    totalUsers: totalUsers.count,
    totalQuestions: totalQuestions.count,
    totalInterviews: totalInterviews.count,
    loginsToday: loginsToday.count,
    loginsThisWeek: loginsThisWeek.count,
    users: usersWithStats,
  });
}
