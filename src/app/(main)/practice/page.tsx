"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function PracticeSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="mx-auto mt-12 max-w-5xl px-4">
      <div className="mx-auto max-w-md rounded-lg border p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Start your interview</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Upload your resume and paste the job description below to begin.
        </p>
        {error && <div className="text-red-500 mb-4 text-sm font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              placeholder="e.g. Google"
              autoComplete="off"
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              name="role"
              placeholder="e.g. Frontend Engineer"
              autoComplete="off"
              required
            />
          </div>
          <div>
            <Label htmlFor="resume">Resume (PDF)</Label>
            <Input
              id="resume"
              name="resume"
              type="file"
              accept="application/pdf,.pdf"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Must be a text-based PDF (not a scanned image).
            </p>
          </div>
          <div>
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              name="jobDescription"
              placeholder="Paste the full job description here..."
              required
              className="min-h-[150px]"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin size-4 mr-2" />}
            Start Interview
          </Button>
        </form>
      </div>
    </div>
  );
}
