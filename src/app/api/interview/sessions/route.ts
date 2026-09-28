import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSession } from "@/lib/interview/services";
import { headers } from "next/headers";
// Import pdf-parse safely
import pdfParse from "pdf-parse/lib/pdf-parse.js";

async function extractResumeText(resume: File): Promise<string> {
  const arrayBuffer = await resume.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const parsed = await pdfParse(buffer);
  return parsed.text.trim();
}

export async function POST(req: NextRequest) {
  const { user } = (await auth.api.getSession({ headers: await headers() })) ?? { user: null };
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const company = formData.get("company") as string;
  const role = formData.get("role") as string;
  const jobDescription = formData.get("jobDescription") as string;
  const resume = formData.get("resume") as File;

  if (!company || !role || !jobDescription || !resume) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const resumeText = await extractResumeText(resume);
  const session = await createSession(user.id, company, role, resumeText, jobDescription);
  
  return NextResponse.json({ session });
}
