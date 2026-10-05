import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { questionsTable } from "@/db/schema/questions";
import { auth } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ questionId: string }> }
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

  const { questionId } = await params;

  await db
    .update(questionsTable)
    .set({ isDeleted: true })
    .where(eq(questionsTable.id, questionId));

  return Response.json({ success: true });
}
