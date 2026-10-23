import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { InterviewClient } from "@/components/custom/practice/interview-client";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function PracticeSessionPage({ params }: PageProps) {
  const { user } = (await auth.api.getSession({ headers: await headers() })) ?? { user: null };
  if (!user) redirect("/sign-in");

  const { sessionId } = await params;

  return <InterviewClient sessionId={sessionId} />;
}
