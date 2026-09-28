import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  interviewSessions,
  candidateProfiles,
  interviewPlans,
  interviewQuestions,
  interviewAnswers,
  interviewEvaluations,
  interviewReports,
} from "@/db/schema/interview";
import { headers } from "next/headers";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { user } = (await auth.api.getSession({ headers: await headers() })) ?? { user: null };
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const session = await db.query.interviewSessions.findFirst({ where: eq(interviewSessions.id, params.id) });
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (session.userId !== user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const profile = await db.query.candidateProfiles.findFirst({ where: eq(candidateProfiles.sessionId, params.id) });
    const plan = await db.query.interviewPlans.findFirst({ where: eq(interviewPlans.sessionId, params.id) });
    const questions = await db.query.interviewQuestions.findMany({ 
      where: eq(interviewQuestions.sessionId, params.id),
      orderBy: (q, { asc }) => [asc(q.orderIndex)]
    });
    
    let answers: any[] = [];
    let evaluations: any[] = [];
    if (questions.length > 0) {
      answers = await db.query.interviewAnswers.findMany({ where: inArray(interviewAnswers.questionId, questions.map(q => q.id)) });
      if (answers.length > 0) {
        evaluations = await db.query.interviewEvaluations.findMany({ where: inArray(interviewEvaluations.answerId, answers.map(a => a.id)) });
      }
    }
    
    const report = await db.query.interviewReports.findFirst({ where: eq(interviewReports.sessionId, params.id) });

    return NextResponse.json({
      session,
      profile,
      plan,
      questions,
      answers,
      evaluations,
      report,
    });
  } catch (error: any) {
    console.error("API Error in GET /api/interview/sessions/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
