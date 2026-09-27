"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type AIEvaluation, aiEvaluationSchema } from "@/lib/zod-schemas";

type AIEvalutionProps = {
  question: {
    title: string;
    description: string;
  };
  answer: {
    id: string;
    content: string;
    aiEvaluation: AIEvaluation | null;
  };
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: its okayish
export function Evaluation({ question, answer }: AIEvalutionProps) {
  const { object, submit, isLoading } = useObject({
    api: "/api/answers/evaluate",
    schema: aiEvaluationSchema,
  });
  const evaluation = answer.aiEvaluation ?? object;

  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="font-medium">AI Evaluation</span>
          <Button
            disabled={!!answer.aiEvaluation || isLoading || !!object}
            onClick={() =>
              submit({
                question: `${question.title}\n\n${question.description}`,
                answer: answer.content,
                answerId: answer.id,
              })
            }
          >
            {isLoading ? "Generating..." : "Generate AI Evaluation"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {evaluation ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="text-xs">{`Score: ${evaluation.score}/10`}</Badge>
              <Badge
                className={
                  evaluation.isCorrect
                    ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-50"
                    : "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-50"
                }
                variant={evaluation.isCorrect ? "default" : "destructive"}
              >
                {evaluation.isCorrect ? "Marked Correct" : "Marked Incorrect"}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Verdict</h4>
              <p className="text-muted-foreground text-sm">
                {evaluation.verdict}
              </p>
            </div>

            {evaluation.strengths?.length ? (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Strengths</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {evaluation.strengths.map((item, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: no updates
                      <li key={`strength-${i}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}

            {evaluation.issues?.length ? (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Issues</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {evaluation.issues.map((item, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: no updates
                      <li key={`issue-${i}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}

            {evaluation.suggestions?.length ? (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Suggestions</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {evaluation.suggestions.map((item, i) => (
                      <li
                        // biome-ignore lint/suspicious/noArrayIndexKey: no updates
                        key={`suggestion-${i}`}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No AI evaluation yet. Click "Generate AI Evaluation" to create one.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
