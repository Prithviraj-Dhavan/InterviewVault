import { Library } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { LayoutSelector } from "@/components/custom/questions/layout-selector";
import { QuestionsList } from "@/components/custom/questions/list";
import { CompanySelect } from "@/components/custom/questions/select/company";
import { RoleSelect } from "@/components/custom/questions/select/role";
import { TrendingQuestions } from "@/components/custom/questions/trending";
import { SearchInput } from "@/components/custom/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <div className="mx-auto max-w-7xl p-4">
        <div className="flex flex-col items-center justify-center pb-6">
          <Badge
            className="group rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-[0.9rem] shadow-primary shadow-sm hover:shadow-md"
            variant="secondary"
          >
            <Library className="group-hover:-rotate-45 transition-transform duration-300" />
            Community Question Library
          </Badge>
          <h1 className="mx-auto text-balance bg-gradient-to-b from-primary via-foreground/85 to-foreground/50 bg-clip-text px-4 py-6 text-center font-bold text-4xl text-transparent tracking-tighter md:text-5xl lg:text-6xl xl:text-6xl">
            Discover & Share Interview Questions
          </h1>
          <p className="text-center text-lg text-muted-foreground">
            Explore a curated collection of Interview Questions from the
            community
          </p>
        </div>
        <div className="flex gap-2">
          <SearchInput />
          <Link href="/questions/new">
            <Button variant="outline">New</Button>
          </Link>
        </div>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          {/* Filters */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <CompanySelect />
            <RoleSelect />
          </div>
          {/* Layout */}
          <LayoutSelector />
        </div>
        <TrendingQuestions />
        <QuestionsList />
      </div>
    </Suspense>
  );
}
