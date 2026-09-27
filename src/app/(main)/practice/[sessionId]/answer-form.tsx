"use client";

import { useActionState } from "react";
import { submitAnswer, type SubmitAnswerState } from "@/actions/interview";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "./submit-button";

const initialState: SubmitAnswerState = {};

export function AnswerForm({
  sessionId,
  orderNumber,
}: {
  sessionId: string;
  orderNumber: number;
}) {
  const boundAction = submitAnswer.bind(null, sessionId, orderNumber);
  const [state, formAction] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <Textarea
        name="answer"
        placeholder="Type your answer here..."
        required
        className="min-h-[150px]"
      />
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
