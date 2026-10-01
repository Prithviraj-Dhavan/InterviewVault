"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  FileText,
  Loader2,
  GraduationCap,
  Sparkles,
  Upload,
  X,
  BriefcaseBusiness,
} from "lucide-react";
import { PrepStorySection } from "@/components/practice/prep-story-section";
import { InterviewGuidelines } from "@/components/custom/practice/interview-guidelines";

export default function PracticeSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/interview/sessions", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start session");
      router.push(`/practice/${data.session.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full">
      <PrepStorySection />

      {/* ── Interview Guidelines ──────────────────────────── */}
      <InterviewGuidelines />

      {/* ── Form Section ─────────────────────────────────── */}
      <div className="relative overflow-hidden py-20">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
          <div className="absolute top-0 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/8 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* ── Left: Info ── */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary">
                <GraduationCap className="h-3.5 w-3.5" />
                AI-Powered Interview Prep
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl leading-tight">
                Land your{" "}
                <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
                  dream role.
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Our AI studies your resume and the job description to craft a
                hyper-personalised interview — then coaches you through every answer.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  {
                    icon: Sparkles,
                    title: "Questions built around you",
                    desc: "Generated from your actual resume and the real job description.",
                  },
                  {
                    icon: BriefcaseBusiness,
                    title: "Role & company specific",
                    desc: "Tailored for the exact role at the exact company you're targeting.",
                  },
                  {
                    icon: FileText,
                    title: "Instant AI feedback",
                    desc: "Get scored, detailed feedback after every single answer.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{title}</p>
                      <p className="text-muted-foreground text-sm">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Right: Form Card ── */}
            <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-xl shadow-black/5 backdrop-blur">

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center gap-1.5 text-sm font-semibold">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      Company
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="e.g. Google"
                      autoComplete="off"
                      required
                      className="h-11 rounded-xl border-border/60 bg-background/60 text-sm placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="flex items-center gap-1.5 text-sm font-semibold">
                      <BriefcaseBusiness className="h-3.5 w-3.5 text-muted-foreground" />
                      Role
                    </Label>
                    <Input
                      id="role"
                      name="role"
                      placeholder="e.g. Frontend Engineer"
                      autoComplete="off"
                      required
                      className="h-11 rounded-xl border-border/60 bg-background/60 text-sm placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Resume (PDF)
                  </Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-7 transition-colors ${
                      fileName
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/60 bg-muted/20 hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      id="resume"
                      name="resume"
                      type="file"
                      accept="application/pdf,.pdf"
                      required
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                    {fileName ? (
                      <>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                          <FileText className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-primary">{fileName}</p>
                          <p className="text-xs text-muted-foreground">Click to replace</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold">Click to upload resume</p>
                          <p className="text-xs text-muted-foreground">Text-based PDF only</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription" className="flex items-center gap-1.5 text-sm font-semibold">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Job Description
                  </Label>
                  <Textarea
                    id="jobDescription"
                    name="jobDescription"
                    placeholder="Paste the full job description here..."
                    required
                    className="min-h-[140px] resize-none rounded-xl border-border/60 bg-background/60 text-sm placeholder:text-muted-foreground/50"
                  />
                </div>

                <Button
                  type="submit"
                  className="group h-12 w-full gap-2 rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparing your interview…
                    </>
                  ) : (
                    <>
                      Start Interview
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Your data is stored securely and used only to generate questions.
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
