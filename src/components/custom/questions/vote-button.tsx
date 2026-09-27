"use client";

import { HandIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";

export type VoteSummary = { votes: number; voted: boolean };

type VoteButtonProps = {
  questionId: string;
  /** undefined means "still loading" */
  summary: VoteSummary | undefined;
  showLabel?: boolean;
  className?: string;
};

/**
 * "I was asked this too" button.
 * The count updates instantly (optimistic) and is replaced by the server's
 * answer once the request settles; on failure it rolls back with a toast.
 */
export function VoteButton({
  questionId,
  summary,
  showLabel = false,
  className,
}: VoteButtonProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: session, isPending: isSessionLoading } = useSession();
  const [optimistic, setOptimistic] = useState<VoteSummary | null>(null);

  const { mutate, isPending } = trpc.votes.set.useMutation({
    onError: (error) => {
      setOptimistic(null);
      toast.error(error.message);
    },
    onSettled: async () => {
      await Promise.all([
        utils.votes.summary.invalidate(),
        utils.votes.top.invalidate(),
      ]);
      setOptimistic(null);
    },
  });

  const current = optimistic ?? summary;

  const handleClick = () => {
    if (!current || isSessionLoading) {
      return;
    }
    if (!session) {
      toast.error("Sign in to mark questions you were asked", {
        action: { label: "Sign in", onClick: () => router.push("/sign-in") },
      });
      return;
    }
    const voted = !current.voted;
    setOptimistic({
      voted,
      votes: Math.max(0, current.votes + (voted ? 1 : -1)),
    });
    mutate({ questionId, voted });
  };

  return (
    <Button
      aria-label={
        current?.voted
          ? "Remove your mark: you were asked this question"
          : "Mark: I was asked this question too"
      }
      aria-pressed={current?.voted ?? false}
      className={cn("gap-1.5", className)}
      disabled={!current || isPending}
      onClick={handleClick}
      size="sm"
      title="I was asked this too"
      type="button"
      variant={current?.voted ? "default" : "outline"}
    >
      <HandIcon />
      {showLabel && <span>Asked this too</span>}
      <span className="tabular-nums">{current ? current.votes : "–"}</span>
    </Button>
  );
}

/** Same button for pages that show a single question (fetches its own count). */
export function QuestionVote({
  questionId,
  className,
}: {
  questionId: string;
  className?: string;
}) {
  const { data } = trpc.votes.summary.useQuery({ questionIds: [questionId] });
  return (
    <VoteButton
      className={className}
      questionId={questionId}
      showLabel
      summary={data?.[questionId]}
    />
  );
}
