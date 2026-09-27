import { startInterviewSession } from "@/actions/interview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PracticeSetupPage() {
  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-2">AI Interview Practice</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Upload your resume and paste the job description. Your interviewer
        will ask a mix of technical and behavioral questions grounded in
        both, explain why it&apos;s asking each one, and only move on once
        you&apos;ve given a real answer.
      </p>
      <form action={startInterviewSession} className="space-y-4">
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" placeholder="e.g. Google" required />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            name="role"
            placeholder="e.g. Frontend Engineer"
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
        <Button type="submit" className="w-full">
          Start Interview
        </Button>
      </form>
    </div>
  );
}
