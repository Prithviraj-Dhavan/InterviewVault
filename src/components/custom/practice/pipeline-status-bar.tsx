import {
  ArrowRight,
  FileCheck2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const NODES = [
  { key: "input", label: "Resume + JD", sub: "PDF + pasted JD", icon: FileCheck2 },
  { key: "question", label: "Question", sub: "grounded + mixed", icon: Sparkles },
  { key: "answer", label: "Answer", sub: "you respond", icon: MessageSquareText },
  { key: "validate", label: "Validate", sub: "rejects gibberish", icon: ShieldCheck },
] as const;

type PipelineStatusBarProps = {
  questionNumber: number;
  totalQuestions: number;
  isFinished: boolean;
  category?: string | null;
  reason?: string | null;
  score?: number | null;
  readinessRating?: string | null;
};

export function PipelineStatusBar({
  questionNumber,
  totalQuestions,
  isFinished,
  category,
  reason,
  score,
  readinessRating,
}: PipelineStatusBarProps) {
  // While the interview is in progress, "Question" and "Answer" are both
  // the live step (the candidate is looking at a question and about to
  // respond). Once finished, every pipeline node is done and Report is lit.
  const activeNodeIndex = isFinished ? -1 : 1;

  const preview = isFinished
    ? `{\n  "score": ${score ?? "?"},\n  "readinessRating": ${JSON.stringify(readinessRating ?? "")}\n}`
    : `{\n  "questionNumber": ${questionNumber},\n  "type": ${JSON.stringify(category ?? "")},\n  "reason": ${JSON.stringify(reason ?? "")}\n}`;

  return (
    <div className="mb-8 rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-red-400/70" />
          <span className="size-2.5 rounded-full bg-yellow-400/70" />
          <span className="size-2.5 rounded-full bg-green-400/70" />
          <span className="ml-2 text-muted-foreground text-xs">
            interview-pipeline
          </span>
        </div>
        <span className="text-muted-foreground text-xs">
          {isFinished
            ? "Complete"
            : `Question ${questionNumber} of ${totalQuestions}`}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-1 overflow-x-auto pb-1">
        {NODES.map((node, idx) => {
          const Icon = node.icon;
          const isNodeActive = idx === activeNodeIndex;
          const isDone = isFinished || idx < activeNodeIndex;
          return (
            <div className="flex shrink-0 items-center" key={node.key}>
              <div
                className={`flex min-w-[110px] flex-col items-center gap-1 rounded-lg border-2 bg-background px-3 py-2.5 text-center transition-colors ${
                  isNodeActive
                    ? "border-primary"
                    : isDone
                      ? "border-primary/40"
                      : "border-border"
                }`}
              >
                <Icon
                  className={`size-4 ${
                    isNodeActive || isDone
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="font-medium text-xs">{node.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {node.sub}
                </span>
              </div>
              {idx < NODES.length - 1 && (
                <ArrowRight className="mx-1 size-4 shrink-0 text-muted-foreground" />
              )}
            </div>
          );
        })}
        <ArrowRight className="mx-1 size-4 shrink-0 text-muted-foreground" />
        <div
          className={`flex min-w-[110px] shrink-0 flex-col items-center gap-1 rounded-lg border-2 bg-background px-3 py-2.5 text-center transition-colors ${
            isFinished ? "border-primary" : "border-border"
          }`}
        >
          <Sparkles
            className={`size-4 ${isFinished ? "text-primary" : "text-muted-foreground"}`}
          />
          <span className="font-medium text-xs">Report</span>
          <span className="text-[10px] text-muted-foreground">
            scored + tips
          </span>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-1.5 border-y py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-block w-6 border-t border-dashed" />
          Validate → Question, "next question" (if more remain)
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-6 border-t border-dashed" />
          Validate → Report, "after last question"
        </div>
      </div>

      <div className="rounded-md bg-muted/50 p-3">
        <p className="mb-1.5 text-[10px] text-muted-foreground uppercase tracking-wide">
          what flows at this step
        </p>
        <pre className="whitespace-pre-wrap font-mono text-xs">{preview}</pre>
      </div>
    </div>
  );
}
