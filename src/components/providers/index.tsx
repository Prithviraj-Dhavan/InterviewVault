"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { TRPCProvider } from "@/trpc/client";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <NuqsAdapter>
        <TRPCProvider>{children}</TRPCProvider>
        <Toaster position="top-center" richColors />
      </NuqsAdapter>
    </ThemeProvider>
  );
}
