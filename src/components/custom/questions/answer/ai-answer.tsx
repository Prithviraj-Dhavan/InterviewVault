"use client";

import { useCompletion } from "@ai-sdk/react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";

export function AiAnswer({
  questionId,
  title,
  description,
  aiAnswer,
}: {
  questionId: string;
  title: string;
  description: string;
  aiAnswer: string | null;
}) {
  const { completion, complete, error, isLoading } = useCompletion({
    api: "/api/completion",
  });

  const prompt = `Title: ${title},Content: ${description}`;

  const handleClick = () => {
    const promise = complete(prompt, {
      body: {
        questionId,
      },
    });

    toast.promise(promise, {
      loading: "Generating answer...",
      success: () => "Answer generated successfully!",
      error: "Error generating answer",
    });
  };

  return (
    <>
      <div className="border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="mr-2 font-semibold text-lg md:text-xl">
            AI Generated Answer
          </h3>
          <Button
            disabled={isLoading || Boolean(aiAnswer || completion)}
            onClick={handleClick}
            variant="secondary"
          >
            <Sparkles className="size-4" />
            Generate
          </Button>
        </div>
      </div>
      <div className="border-y px-4 py-3">
        {aiAnswer ? (
          <Streamdown className="mt-3 max-w-5xl text-foreground/80">
            {aiAnswer}
          </Streamdown>
        ) : (
          <Streamdown className="mt-3 max-w-5xl text-foreground/80">
            {completion
              ? completion
              : "> Click the generate button and witness some ai magic"}
          </Streamdown>
        )}
        {error && (
          <div className="mt-2 text-red-500">
            <p>Error: {error.message}</p>
          </div>
        )}
      </div>
    </>
  );
}
