import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { interviewSessions, interviewReports } from "@/db/schema/interview";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [currentUser] = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, session.user.id));

  if (!currentUser?.isAdmin)
    return Response.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;

  const sessions = await db
    .select({
      id: interviewSessions.id,
      company: interviewSessions.company,
      role: interviewSessions.role,
      status: interviewSessions.status,
      createdAt: interviewSessions.createdAt,
    })
    .from(interviewSessions)
    .where(eq(interviewSessions.userId, userId))
    .orderBy(interviewSessions.createdAt);

  return Response.json({ sessions });
}
