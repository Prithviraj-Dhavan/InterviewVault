import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { interviewSessions, interviewTurns } from "@/db/schema/interview";
import { auth } from "@/lib/auth";
import { AnswerForm } from "./answer-form";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

type QuestionEvaluation = {
  questionNumber: number;
  question: string;
  answer: string;
  feedback: string;
  suggestedImprovement?: string;
  score: number;
};

type ParsedFeedback = {
  overallSummary?: {
    strengths: string;
    gaps: string;
    readinessRating: string;
  };
  questionEvaluations?: QuestionEvaluation[];
};

export default async function PracticeSessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  const [session] = await db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId))
    .limit(1);

  if (!session) {
    return notFound();
  }

  const { user } = (await auth.api.getSession({
    headers: await headers(),
  })) ?? { user: null };

  const isOwner = user?.id === session.userId;

  const turns = await db
    .select()
    .from(interviewTurns)
    .where(eq(interviewTurns.sessionId, sessionId))
    .orderBy(asc(interviewTurns.orderNumber));

  const currentTurn = turns[turns.length - 1];
  const isAnswered = currentTurn?.answerText != null;
  const isFinished = session.status === "completed";

  let parsedFeedback: ParsedFeedback | null = null;
  if (isFinished && session.feedback) {
    try {
      parsedFeedback = JSON.parse(session.feedback);
    } catch {
      // Fallback for non-JSON feedback
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold mb-4">
        Interview for {session.role} at {session.company}
      </h1>

      <div className="space-y-8">
        {turns.map((turn) => (
          <div key={turn.id} className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-sm">
                  Interviewer (Question {turn.orderNumber})
                </span>
                <Badge
                  className="capitalize"
                  variant={turn.category === "technical" ? "default" : "secondary"}
                >
                  {turn.category}
                </Badge>
              </div>
              <p>{turn.questionText}</p>
              {turn.reason && (
                <p className="mt-2 text-muted-foreground text-xs italic">
                  Why this question: {turn.reason}
                </p>
              )}
            </div>
            {turn.answerText && (
              <div className="bg-primary/10 p-4 rounded-lg ml-8">
                <span className="font-semibold text-sm mb-2 block">You</span>
                <p>{turn.answerText}</p>
              </div>
            )}
          </div>
        ))}

        {!isAnswered && !isFinished && currentTurn && (
          <div className="space-y-4 ml-8">
            {isOwner ? (
              <AnswerForm
                orderNumber={currentTurn.orderNumber}
                sessionId={sessionId}
              />
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 text-sm">
                This is a read-only view. Only the session creator can answer.
              </div>
            )}
          </div>
        )}

        {isFinished && (
          <div className="mt-8 p-6 bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-2">
                Final Scorecard
              </h2>
              <div className="flex items-center gap-4">
                <p className="text-lg">
                  <strong>Overall Score:</strong> {session.score}/100
                </p>
                {parsedFeedback?.overallSummary?.readinessRating && (
                  <span className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 rounded-full font-medium text-sm">
                    {parsedFeedback.overallSummary.readinessRating}
                  </span>
                )}
              </div>
            </div>

            {parsedFeedback ? (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-white dark:bg-background p-4 rounded-md shadow-sm border border-green-100 dark:border-green-900/50">
                    <h3 className="font-semibold text-green-700 dark:text-green-500 mb-2">
                      Strengths
                    </h3>
                    <p className="text-sm">
                      {parsedFeedback.overallSummary?.strengths}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-background p-4 rounded-md shadow-sm border border-green-100 dark:border-green-900/50">
                    <h3 className="font-semibold text-red-700 dark:text-red-500 mb-2">
                      Gaps to Address
                    </h3>
                    <p className="text-sm">{parsedFeedback.overallSummary?.gaps}</p>
                  </div>
                </div>

                <div className="space-y-4 mt-8">
                  <h3 className="text-xl font-bold text-foreground">
                    Question Breakdown
                  </h3>
                  {parsedFeedback.questionEvaluations?.map((evalItem, idx) => (
                    <div
                      className="bg-white dark:bg-background p-5 rounded-lg border shadow-sm"
                      key={idx}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold flex-1">
                          Q{evalItem.questionNumber}: {evalItem.question}
                        </h4>
                        <span className="ml-4 px-2 py-1 bg-muted text-muted-foreground rounded text-sm font-medium whitespace-nowrap">
                          {evalItem.score}/10
                        </span>
                      </div>
                      <div className="mb-4 text-sm text-muted-foreground pl-4 border-l-2 border-primary/20">
                        {evalItem.answer}
                      </div>
                      <div className="text-sm bg-muted/50 p-3 rounded">
                        <strong>Feedback:</strong> {evalItem.feedback}
                      </div>
                      {evalItem.suggestedImprovement && (
                        <div className="text-sm bg-primary/5 border border-primary/20 p-3 rounded mt-2">
                          <strong>How to improve:</strong>{" "}
                          {evalItem.suggestedImprovement}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-2 mt-4">
                <strong>Feedback:</strong>
                <p className="whitespace-pre-wrap mt-2">{session.feedback}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
