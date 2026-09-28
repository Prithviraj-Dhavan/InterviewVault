import { InterviewClient } from "@/components/custom/practice/interview-client";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function PracticeSessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  return <InterviewClient sessionId={sessionId} />;
}
