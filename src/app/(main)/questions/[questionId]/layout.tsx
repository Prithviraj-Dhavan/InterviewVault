import { Suspense } from "react";
import { Loading } from "@/components/custom/loading";

export default function QuestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto max-w-7xl border-t px-4">
      <div className="-col-start-1 absolute left-[-80] row-span-full row-start-1 hidden h-full min-h-screen w-20 border-x border-x-(--pattern-fg) border-t bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-black)]/5 md:block dark:[--pattern-fg:var(--color-white)]/10" />
      <div className="absolute right-[-80] col-start-1 row-span-full row-start-1 hidden h-full min-h-screen w-20 border-x border-x-(--pattern-fg) border-t bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-black)]/5 md:block dark:[--pattern-fg:var(--color-white)]/10" />
      <h1 className="text-balance border-b bg-gradient-to-b from-primary via-foreground/85 to-foreground/50 bg-clip-text px-4 py-6 font-bold text-2xl tracking-tighter md:text-3xl">
        Question
      </h1>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </div>
  );
}
