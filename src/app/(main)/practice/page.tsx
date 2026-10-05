import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user as userSchema } from "@/db/schema/auth";
import { interviewSessions, interviewReports } from "@/db/schema/interview";
import { eq, desc } from "drizzle-orm";
import PracticeClient from "./practice-client";
import AdminInterviewsClient from "./admin-interviews-client";

export default async function PracticePage() {
  const { user } = (await auth.api.getSession({ headers: await headers() })) ?? { user: null };
  if (!user) redirect("/sign-in");

  const [currentUser] = await db
    .select({ isAdmin: userSchema.isAdmin })
    .from(userSchema)
    .where(eq(userSchema.id, user.id));

  if (currentUser?.isAdmin) {
    const sessions = await db
      .select({
        id: interviewSessions.id,
        company: interviewSessions.company,
        role: interviewSessions.role,
        status: interviewSessions.status,
        createdAt: interviewSessions.createdAt,
        userId: interviewSessions.userId,
        userName: userSchema.name,
        userEmail: userSchema.email,
        userImage: userSchema.image,
      })
      .from(interviewSessions)
      .leftJoin(userSchema, eq(interviewSessions.userId, userSchema.id))
      .orderBy(desc(interviewSessions.createdAt));

    const reports = await db.select().from(interviewReports);

    return <AdminInterviewsClient sessions={sessions} reports={reports} />;
  }

  return <PracticeClient />;
}
