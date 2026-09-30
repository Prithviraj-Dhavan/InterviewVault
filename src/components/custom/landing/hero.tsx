"use client";

import { ArrowRight, ChevronRight, Github } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroImage } from "./hero-image";

export function Hero() {
  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="-z-10 -translate-x-1/2 absolute top-0 left-1/2 h-[1000px] w-[1000px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:16px_16px] opacity-15" />

      <div className="container relative z-10 mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Badge */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-6 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1 text-sm backdrop-blur-sm">
              <span className="text-muted-foreground">
                Share questions, solutions, and insights
              </span>
              <ChevronRight className="ml-1 h-4 w-4 text-muted-foreground" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="text-balance bg-gradient-to-tl from-primary/10 via-foreground/85 to-foreground/50 bg-clip-text text-center text-4xl text-transparent tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Say Hello to Effortless AI Interviews and Question Management
          </motion.h1>

          {/* Description */}
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-6 max-w-2xl text-center text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            InterviewVault lets you collect and share real interview questions
            with solutions — organized, searchable, and ready for AI mock interviews.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/sign-in">
              <Button
                className="group relative overflow-hidden rounded-full bg-primary px-6 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-primary/30"
                size="lg"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 z-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Button>
            </Link>

            <Link
              href="https://github.com/Prithviraj-Dhavan/InterviewVault"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Button
                className="flex items-center gap-2 rounded-full border-border bg-background/50 backdrop-blur-sm"
                size="lg"
                variant="outline"
              >
                <Github className="h-4 w-4" />
                Star on GitHub
              </Button>
            </Link>
          </motion.div>

          {/* Feature Image */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative mx-auto mt-16 max-w-4xl"
            initial={{ opacity: 0, y: 40 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              type: "spring",
              stiffness: 50,
            }}
          >
            <div className="overflow-hidden rounded-xl border border-border/40 bg-background/50 shadow-xl backdrop-blur-sm">
              <div className="flex h-10 items-center border-border/40 border-b bg-muted/50 px-4">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="mx-auto flex items-center rounded-md bg-background/50 px-3 py-1 text-muted-foreground text-xs">
                  https://interview-vault.vercel.app
                </div>
              </div>
              <div className="relative">
                <HeroImage />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0" />
              </div>
            </div>

            {/* Floating elements for visual interest */}
            <div className="-top-6 -right-6 absolute h-12 w-12 rounded-lg border border-border/40 bg-background/80 p-3 shadow-lg backdrop-blur-md">
              <div className="h-full w-full rounded-md bg-primary/20" />
            </div>
            <div className="-bottom-4 -left-4 absolute h-8 w-8 rounded-full border border-border/40 bg-background/80 shadow-lg backdrop-blur-md" />
            <div className="-bottom-6 absolute right-12 h-10 w-10 rounded-lg border border-border/40 bg-background/80 p-2 shadow-lg backdrop-blur-md">
              <div className="h-full w-full rounded-md bg-green-500/20" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
