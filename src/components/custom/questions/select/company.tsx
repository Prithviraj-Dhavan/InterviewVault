"use client";

import { Suspense } from "react";
import { trpc } from "@/trpc/client";
import { QuestionsSelect } from ".";

export function CompanySelect() {
  const { data, status } = trpc.companies.get.useQuery();
  return (
    <Suspense>
      <QuestionsSelect data={data} status={status} title="Company" />
    </Suspense>
  );
}
