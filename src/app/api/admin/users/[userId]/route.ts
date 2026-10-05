import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";

export async function DELETE(
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

  // Prevent admin from deleting themselves
  if (userId === session.user.id)
    return Response.json({ error: "Cannot delete your own account" }, { status: 400 });

  // Cascades will handle sessions, questions (postedBy set null), interviews, etc.
  await db.delete(user).where(eq(user.id, userId));

  return Response.json({ success: true });
}
