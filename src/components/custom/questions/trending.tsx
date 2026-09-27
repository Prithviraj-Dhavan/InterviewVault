"use client";

import { FlameIcon, HandIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";

const RANGES = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
] as const;

type Range = (typeof RANGES)[number]["value"];

const SKELETON_KEYS = ["a", "b", "c", "d", "e"];

/**
 * "Most asked" strip. Shows nothing until at least one question has been
 * marked "asked this too", so a fresh install looks exactly as before.
 */
export function TrendingQuestions() {
  const [range, setRange] = useState<Range>("all");
  const { data, isLoading, isError } = trpc.votes.top.useQuery({
    window: range,
    limit: 5,
  });

  if (isError) {
    return null;
  }
  if (!isLoading && range === "all" && (data?.length ?? 0) === 0) {
    return null;
  }

  return (
    <section
      aria-label="Most asked questions"
      className="mb-6 rounded-xl border bg-card/50 p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold text-lg">
          <FlameIcon className="size-5 text-primary" />
          Most asked
        </h2>
        <div className="flex gap-1">
          {RANGES.map((item) => (
            <Button
              aria-pressed={range === item.value}
              key={item.value}
              onClick={() => setRange(item.value)}
              size="sm"
              type="button"
              variant={range === item.value ? "secondary" : "ghost"}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
          {SKELETON_KEYS.map((key) => (
            <div
              className="h-24 animate-pulse rounded-lg border bg-muted/40"
              key={key}
            />
          ))}
        </div>
      )}

      {!isLoading && (data?.length ?? 0) === 0 && (
        <p className="text-muted-foreground text-sm">
          No marks in this period yet. Open a question and press “Asked this
          too”.
        </p>
      )}

      {!isLoading && (data?.length ?? 0) > 0 && (
        <ol className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
          {data?.map((question, index) => (
            <li key={question.id}>
              <Link
                className="flex h-full flex-col justify-between gap-2 rounded-lg border bg-card p-3 transition-colors hover:border-primary/50"
                href={`/questions/${question.id}`}
              >
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary tabular-nums">
                    {index + 1}
                  </span>
                  <span className="line-clamp-2 font-medium text-sm">
                    {question.title}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Badge className="max-w-[60%] truncate" variant="secondary">
                    {question.companyName ?? "Not Available"}
                  </Badge>
                  <span className="flex items-center gap-1 text-muted-foreground text-sm tabular-nums">
                    <HandIcon className="size-3.5" />
                    {question.votes}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
