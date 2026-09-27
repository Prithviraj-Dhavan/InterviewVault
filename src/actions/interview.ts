"use server";

import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
// Import the inner module directly — importing the "pdf-parse" package's
// top-level index.js runs a debug snippet that tries to read a sample PDF
// from disk when it thinks it's being run directly, which throws inside
// Next.js's server action bundling. Importing the actual parser avoids that.
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { interviewSessions, interviewTurns } from "@/db/schema/interview";
import { auth } from "@/lib/auth";

const MAX_SESSIONS_PER_DAY = 50;
// Total questions in a session. Kept even so the mixture can be balanced.
const TOTAL_TURNS = 6;
const MIN_ANSWER_LENGTH = 15;
const MODEL = "openai/gpt-oss-120b";

type Category = "technical" | "behavioral";

// ---------------------------------------------------------------------------
// Resume parsing
// ---------------------------------------------------------------------------

async function extractResumeText(resume: File): Promise<string> {
  if (resume.type !== "application/pdf") {
    throw new Error("Please upload your resume as a PDF file.");
  }
  const arrayBuffer = await resume.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const parsed = await pdfParse(buffer);
  const text = parsed.text.trim();
  if (text.length < 50) {
    throw new Error(
      "Couldn't read enough text from that PDF. Please upload a text-based resume (not a scanned image)."
    );
  }
  return text;
}

// ---------------------------------------------------------------------------
// Answer validation — cheap heuristic first, then an AI check for subtler
// nonsense. Nothing is saved to the database until an answer passes both.
// ---------------------------------------------------------------------------

const VOWEL_PATTERN = /[aeiou]/i;
const REAL_WORD_PATTERN = /[a-z]{3,}/i;

function looksLikeGarbage(answer: string): string | null {
  const trimmed = answer.trim();
  if (trimmed.length < MIN_ANSWER_LENGTH) {
    return "That answer looks too short. Please explain your thinking in a full sentence or two.";
  }
  if (!REAL_WORD_PATTERN.test(trimmed)) {
    return "That doesn't look like a real answer. Please type an actual response to the question.";
  }
  if (!VOWEL_PATTERN.test(trimmed)) {
    return "That doesn't look like a real answer. Please type an actual response to the question.";
  }
  return null;
}

const answerCheckSchema = z.object({
  isGenuineAttempt: z
    .boolean()
    .describe(
      "true only if this is a real, on-topic attempt to answer the question — even a short, weak, or partially wrong answer counts as genuine. false for gibberish, random keyboard mashing, or text that is not attempting to answer at all."
    ),
  feedback: z
    .string()
    .describe(
      "If isGenuineAttempt is false, one short, friendly sentence telling the candidate what's wrong. Empty string if isGenuineAttempt is true."
    ),
});

async function validateAnswer(
  question: string,
  answer: string
): Promise<{ valid: true } | { valid: false; message: string }> {
  const heuristicIssue = looksLikeGarbage(answer);
  if (heuristicIssue) {
    return { valid: false, message: heuristicIssue };
  }

  try {
    const { object } = await generateObject({
      model: groq(MODEL),
      schema: answerCheckSchema,
      system:
        "You are checking whether a candidate's interview answer is a genuine attempt to answer the question, as opposed to gibberish, random text, or something completely off-topic. Be lenient: short, incomplete, or incorrect answers still count as genuine as long as they are trying to answer.",
      prompt: `Question: ${question}\n\nCandidate's answer: ${answer}`,
    });

    if (!object.isGenuineAttempt) {
      return {
        valid: false,
        message:
          object.feedback ||
          "That doesn't look like a genuine answer to the question. Please try again.",
      };
    }
    return { valid: true };
  } catch (error) {
    console.error("Answer validation call failed, allowing answer through.", error);
    // If the AI check itself fails (rate limit, etc.), don't block the
    // candidate — the heuristic above already caught the obvious garbage.
    return { valid: true };
  }
}

// ---------------------------------------------------------------------------
// Question generation
// ---------------------------------------------------------------------------

const questionSchema = z.object({
  question: z.string().describe("The single interview question to ask."),
  reason: z
    .string()
    .describe(
      "One short sentence explaining WHY this question is being asked — what it's meant to probe for, based on the resume/JD/role. Shown to the candidate alongside the question."
    ),
  category: z.enum(["technical", "behavioral"]),
});

function buildContext(session: {
  company: string;
  role: string;
  resumeText: string;
  jobDescription: string;
}) {
  return `Company: ${session.company}
Role: ${session.role}

Job Description:
${session.jobDescription}

Candidate's Resume:
${session.resumeText}`;
}

async function generateQuestion(
  context: string,
  transcript: string,
  counts: { technical: number; behavioral: number }
): Promise<{ question: string; reason: string; category: Category }> {
  const nextCategoryHint =
    counts.technical > counts.behavioral
      ? "The session so far has more technical questions than behavioral ones — lean toward a BEHAVIORAL question this time."
      : counts.behavioral > counts.technical
        ? "The session so far has more behavioral questions than technical ones — lean toward a TECHNICAL question this time."
        : "Counts are currently even — pick whichever fits best next.";

  const fallback: { question: string; reason: string; category: Category } = {
    question:
      counts.technical <= counts.behavioral
        ? "Walk me through a technical decision you made in a recent project and why you made it."
        : "Tell me about a time you had to work through a disagreement with a teammate.",
    reason:
      "Fallback question used because the AI question generator was unavailable.",
    category: counts.technical <= counts.behavioral ? "technical" : "behavioral",
  };

  try {
    const { object } = await generateObject({
      model: groq(MODEL),
      schema: questionSchema,
      system: `You are an expert technical interviewer. Using the candidate's resume and the job description below, ask ONE specific interview question at a time.

Rules:
- Base the question on concrete things in the resume (projects, skills, past roles) and on what the job description asks for.
- Across the whole interview you must ask a genuine MIX of technical questions (about specific skills/projects/tools on the resume) and behavioral questions (about how they work, past situations, teamwork, decisions) — not all of one type.
- ${nextCategoryHint}
- Never repeat a question already asked in the transcript.
- Ask only ONE question, with no introductory text.`,
      prompt: `${context}\n\nInterview transcript so far:\n${transcript || "(no questions asked yet — this is the first question)"}`,
    });
    return object;
  } catch (error) {
    console.error("AI question generation failed, using fallback.", error);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Scorecard
// ---------------------------------------------------------------------------

const scorecardSchema = z.object({
  score: z.number().min(0).max(100),
  overallSummary: z.object({
    strengths: z.string(),
    gaps: z.string(),
    readinessRating: z.string(),
  }),
  questionEvaluations: z.array(
    z.object({
      questionNumber: z.number(),
      question: z.string(),
      answer: z.string(),
      feedback: z.string().describe("What was good or missing in this answer."),
      suggestedImprovement: z
        .string()
        .describe("A concrete, rewritten or improved way to answer this question better."),
      score: z.number().min(0).max(10),
    })
  ),
});

async function generateScorecard(context: string, transcript: string) {
  try {
    const { object } = await generateObject({
      model: groq(MODEL),
      schema: scorecardSchema,
      system:
        "You are an expert interviewer evaluating a completed interview. Use the candidate's resume, the job description, and the full transcript of questions and answers. Provide an overall readiness score out of 100, a summary of strengths and gaps, and for EACH question: feedback on the answer given, and a concrete suggested improvement showing how to answer it better.",
      prompt: `${context}\n\nFull interview transcript:\n${transcript}`,
    });
    return { score: object.score, feedback: JSON.stringify(object) };
  } catch (error) {
    console.error("AI scorecard generation failed, using structured fallback.", error);
    const feedback = JSON.stringify({
      score: 50,
      overallSummary: {
        strengths: "You completed the interview flow successfully.",
        gaps: "The AI evaluator is temporarily unavailable. Please try again shortly.",
        readinessRating: "Evaluator Unavailable",
      },
      questionEvaluations: [],
    });
    return { score: 50, feedback };
  }
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

export async function startInterviewSession(formData: FormData) {
  const { user } = (await auth.api.getSession({
    headers: await headers(),
  })) ?? { user: null };

  if (!user) {
    throw new Error("Unauthorized");
  }

  const company = (formData.get("company") as string | null)?.trim();
  const role = (formData.get("role") as string | null)?.trim();
  const jobDescription = (formData.get("jobDescription") as string | null)?.trim();
  const resumeFile = formData.get("resume") as File | null;

  if (!(company && role && jobDescription)) {
    throw new Error("Company, role, and job description are all required.");
  }
  if (!resumeFile || resumeFile.size === 0) {
    throw new Error("Please upload your resume as a PDF.");
  }

  const resumeText = await extractResumeText(resumeFile);

  // Rate limiting (max sessions per day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [sessionCount] = await db
    .select({ count: sql`count(*)` })
    .from(interviewSessions)
    .where(
      and(
        eq(interviewSessions.userId, user.id),
        sql`${interviewSessions.createdAt} >= ${today.toISOString()}`
      )
    );

  if (Number(sessionCount?.count) >= MAX_SESSIONS_PER_DAY) {
    throw new Error(
      `Daily limit of ${MAX_SESSIONS_PER_DAY} interview sessions reached`
    );
  }

  const [session] = await db
    .insert(interviewSessions)
    .values({
      userId: user.id,
      company,
      role,
      resumeText,
      jobDescription,
      status: "in_progress",
    })
    .returning();

  const context = buildContext(session);
  const first = await generateQuestion(context, "", {
    technical: 0,
    behavioral: 0,
  });

  await db.insert(interviewTurns).values({
    sessionId: session.id,
    questionText: first.question,
    reason: first.reason,
    category: first.category,
    orderNumber: 1,
  });

  redirect(`/practice/${session.id}`);
}

export type SubmitAnswerState = { error?: string };

export async function submitAnswer(
  sessionId: string,
  orderNumber: number,
  _prevState: SubmitAnswerState,
  formData: FormData
): Promise<SubmitAnswerState> {
  const { user } = (await auth.api.getSession({
    headers: await headers(),
  })) ?? { user: null };

  if (!user) {
    return { error: "You must be signed in to answer." };
  }

  const answer = (formData.get("answer") as string | null)?.trim() ?? "";

  const session = await db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId))
    .limit(1)
    .then((res) => res[0]);

  if (!session) {
    return { error: "Session not found." };
  }
  if (session.userId !== user.id) {
    return { error: "You are not the owner of this session." };
  }

  const turns = await db
    .select()
    .from(interviewTurns)
    .where(eq(interviewTurns.sessionId, sessionId));

  const currentTurn = turns.find((t) => t.orderNumber === orderNumber);
  if (!currentTurn) {
    return { error: "That question could not be found." };
  }

  // Validate BEFORE saving anything — a rejected answer never touches the DB
  // and the candidate stays on the same question.
  const validation = await validateAnswer(currentTurn.questionText, answer);
  if (!validation.valid) {
    return { error: validation.message };
  }

  await db
    .update(interviewTurns)
    .set({ answerText: answer })
    .where(
      and(
        eq(interviewTurns.sessionId, sessionId),
        eq(interviewTurns.orderNumber, orderNumber)
      )
    );

  const updatedTurns = turns
    .map((t) => (t.orderNumber === orderNumber ? { ...t, answerText: answer } : t))
    .sort((a, b) => a.orderNumber - b.orderNumber);

  const context = buildContext(session);
  let transcript = "";
  for (const t of updatedTurns) {
    transcript += `\n[${t.category}] Interviewer: ${t.questionText}\n(Why asked: ${t.reason})\n`;
    if (t.answerText) {
      transcript += `Candidate: ${t.answerText}\n`;
    }
  }

  if (orderNumber < TOTAL_TURNS) {
    const counts = updatedTurns.reduce(
      (acc, t) => {
        if (t.category === "technical") {
          acc.technical += 1;
        } else {
          acc.behavioral += 1;
        }
        return acc;
      },
      { technical: 0, behavioral: 0 }
    );

    const next = await generateQuestion(context, transcript, counts);

    await db.insert(interviewTurns).values({
      sessionId,
      questionText: next.question,
      reason: next.reason,
      category: next.category,
      orderNumber: orderNumber + 1,
    });
  } else {
    const { score, feedback } = await generateScorecard(context, transcript);
    await db
      .update(interviewSessions)
      .set({ status: "completed", score, feedback })
      .where(eq(interviewSessions.id, sessionId));
  }

  redirect(`/practice/${sessionId}`);
}
