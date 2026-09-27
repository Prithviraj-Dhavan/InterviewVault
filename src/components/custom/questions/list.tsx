"use client";

import { parseAsInteger, useQueryState } from "nuqs";
import { Loading } from "@/components/custom/loading";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { QuestionCard } from "./card";

export const QuestionsList = () => {
  const [search] = useQueryState("search");
  const [layout] = useQueryState("layout", { defaultValue: "grid" });
  const [company] = useQueryState("company");
  const [role] = useQueryState("role");
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  // biome-ignore lint/style/noMagicNumbers: Not magic want a number divisible by 3
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(9));

  const DEBOUNCE_TIME = 300;

  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_TIME);
  const {
    data: api,
    isLoading,
    error,
    isError,
  } = trpc.questions.get.useQuery({
    search: debouncedSearch,
    company,
    role,
    page,
    limit,
  });

  // One request for the vote counts of every card on this page
  const questionIds = api?.data.map((question) => question.id) ?? [];
  const { data: votes } = trpc.votes.summary.useQuery(
    { questionIds },
    { enabled: questionIds.length > 0 }
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="flex h-96 items-center justify-center text-5xl text-rose-300 tracking-tighter">
        Error: {error.message}
      </div>
    );
  }

  if (!api || api.data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center text-5xl text-muted-foreground tracking-tighter">
        No Question found
      </div>
    );
  }

  return (
    <>
      <div
        // TODO: Add animation for layout shifts using framer motion
        className={cn(
          "mt-6 grid gap-4",
          layout === "flex"
            ? "grid-cols-1"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          api.data.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              votes={votes?.[question.id]}
            />
          ))
        )}
      </div>
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem aria-disabled={page === 1}>
            <PaginationPrevious
              className={cn(page === 1 && "pointer-events-none opacity-50")}
              onClick={() => setPage(page - 1)}
            />
          </PaginationItem>
          {Array.from(
            { length: Math.ceil(api.total / limit) },
            (_, i) => i + 1
          ).map((pageNum) => (
            <PaginationItem key={pageNum}>
              <PaginationLink
                isActive={pageNum === page}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem aria-disabled={page >= Math.ceil(api.total / limit)}>
            <PaginationNext
              className={cn(
                page >= Math.ceil(api.total / limit) &&
                  "pointer-events-none opacity-50"
              )}
              onClick={() => setPage(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
};
