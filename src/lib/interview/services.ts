import { eq, inArray, and } from "drizzle-orm";
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
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import {
  candidateProfileSchema,
  interviewPlanSchema,
  interviewQuestionSchema,
  interviewEvaluationSchema,
  interviewReportSchema,
} from "./schemas";
import {
  buildProfilePrompt,
  buildPlanPrompt,
  buildQuestionPrompt,
  buildEvaluationPrompt,
  buildReportPrompt,
} from "./prompts";

import { INTERVIEW_MODEL } from "../interview-constants";

export async function createSession(userId: string, company: string, role: string, resumeText: string, jdText: string) {
  const [session] = await db
    .insert(interviewSessions)
    .values({ userId, company, role, resumeText, jdText, status: "INPUT" })
    .returning();
  return session;
}

export async function generateProfile(sessionId: string) {
  const session = await db.query.interviewSessions.findFirst({ where: eq(interviewSessions.id, sessionId) });
  if (!session) throw new Error("Session not found");

  const existingProfile = await db.query.candidateProfiles.findFirst({ where: eq(candidateProfiles.sessionId, sessionId) });
  if (existingProfile) return existingProfile;

  let object;
  try {
    const res = await generateObject({
      model: groq(INTERVIEW_MODEL),
      schema: candidateProfileSchema,
      prompt: buildProfilePrompt(session.resumeText, session.jdText),
      temperature: 0.2,
    });
    object = res.object;
  } catch (error) {
    console.error("GROQ ERROR in generateProfile:", error);
    throw error;
  }

  const [profile] = await db
    .insert(candidateProfiles)
    .values({
      sessionId,
      level: object.level,
      skills: object.skills,
      gaps: object.gaps,
      rawLlmJson: object,
    })
    .returning();

  await db.update(interviewSessions).set({ status: "ANALYSIS" }).where(eq(interviewSessions.id, sessionId));
  return profile;
}

export async function generatePlan(sessionId: string) {
  const session = await db.query.interviewSessions.findFirst({ where: eq(interviewSessions.id, sessionId) });
  const profile = await db.query.candidateProfiles.findFirst({ where: eq(candidateProfiles.sessionId, sessionId) });
  if (!session || !profile) throw new Error("Session or Profile not found");

  const existingPlan = await db.query.interviewPlans.findFirst({ where: eq(interviewPlans.sessionId, sessionId) });
  if (existingPlan) return existingPlan;

  let object;
  try {
    const res = await generateObject({
      model: groq(INTERVIEW_MODEL),
      schema: interviewPlanSchema,
      prompt: buildPlanPrompt(profile.rawLlmJson, session.jdText, session.resumeText, session.company, session.role),
      temperature: 0.2,
    });
    object = res.object;
  } catch (error) {
    console.error("GROQ ERROR in generatePlan:", error);
    throw error;
  }

  const [plan] = await db
    .insert(interviewPlans)
    .values({
      sessionId,
      topics: object.topics,
    })
    .returning();

  await db.update(interviewSessions).set({ status: "PLANNING" }).where(eq(interviewSessions.id, sessionId));
  return plan;
}

export async function generateNextQuestion(sessionId: string) {
  const session = await db.query.interviewSessions.findFirst({ where: eq(interviewSessions.id, sessionId) });
  const profile = await db.query.candidateProfiles.findFirst({ where: eq(candidateProfiles.sessionId, sessionId) });
  const plan = await db.query.interviewPlans.findFirst({ where: eq(interviewPlans.sessionId, sessionId) });
  if (!session || !profile || !plan) throw new Error("Missing dependencies for question");

  // Get transcript
  const questions = await db.query.interviewQuestions.findMany({
    where: eq(interviewQuestions.sessionId, sessionId),
    orderBy: (qs, { asc }) => [asc(qs.orderIndex)],
  });

  const answers = questions.length > 0
    ? await db.query.interviewAnswers.findMany({
      where: inArray(interviewAnswers.questionId, questions.map((q) => q.id)),
    })
    : [];

  const evaluations = answers.length > 0
    ? await db.query.interviewEvaluations.findMany({
      where: inArray(interviewEvaluations.answerId, answers.map((a) => a.id)),
    })
    : [];

  // Calculate average score to determine strong/weak user
  let avgScore = 0;
  if (evaluations.length > 0) {
    avgScore = evaluations.reduce((acc, ev) => acc + ev.score, 0) / evaluations.length;
  }

  // Calculate if follow-up is needed
  let isFollowUp = false;
  let parentQuestionId = null;
  let currentTopic = "";

  if (questions.length > 0) {
    const lastQuestion = questions[questions.length - 1];
    const lastAnswer = answers.find((a) => a.questionId === lastQuestion.id);
    if (!lastAnswer) {
      // Last question isn't answered yet! Just return it.
      return lastQuestion;
    }

    // HARD LIMIT: Maximum 7 questions total (including follow-ups)
    if (questions.length >= 7) {
      await db.update(interviewSessions).set({ status: "REPORT" }).where(eq(interviewSessions.id, sessionId));
      return null;
    }

    // Strong user limit: If they have answered at least 5 questions and their average score is >= 4, end early
    if (questions.length >= 5 && avgScore >= 4) {
      await db.update(interviewSessions).set({ status: "REPORT" }).where(eq(interviewSessions.id, sessionId));
      return null;
    }

    const lastEval = evaluations.find((e) => e.answerId === lastAnswer.id);
    if (lastEval && lastEval.score < 4) {
      // Count previous followups for this parent
      const parentId = lastQuestion.parentQuestionId || lastQuestion.id;
      const followUps = questions.filter((q) => q.parentQuestionId === parentId);
      // ONLY allow 1 follow-up total for a question
      if (followUps.length < 1) {
        isFollowUp = true;
        parentQuestionId = parentId;
        currentTopic = lastQuestion.topic;
      }
    }
  }

  // If not a follow up, determine next topic from plan
  if (!isFollowUp) {
    // Basic logic: pick first topic that hasn't reached its question count.
    const topicsArr = plan.topics as any[];
    let pickedTopic = topicsArr[0].topic;
    for (const t of topicsArr) {
      const qCount = questions.filter(q => q.topic === t.topic && !q.parentQuestionId).length;
      if (qCount < t.question_count) {
        pickedTopic = t.topic;
        break;
      }
    }
    
    // If we've asked all planned main questions, end the interview
    const totalTarget = topicsArr.reduce((acc, t) => acc + t.question_count, 0);
    const mainQuestions = questions.filter(q => !q.parentQuestionId).length;
    if (mainQuestions >= totalTarget) {
      await db.update(interviewSessions).set({ status: "REPORT" }).where(eq(interviewSessions.id, sessionId));
      return null;
    }
    currentTopic = pickedTopic;
  }

  // Build transcript string
  let transcriptStr = "";
  for (const q of questions) {
    transcriptStr += `\nInterviewer: ${q.prompt}`;
    const ans = answers.find(a => a.questionId === q.id);
    if (ans) {
      transcriptStr += `\nCandidate: ${ans.content}`;
      const ev = evaluations.find(e => e.answerId === ans.id);
      if (ev) transcriptStr += `\n(Eval Score: ${ev.score})`;
    }
  }

  const { object } = await generateObject({
    model: groq(INTERVIEW_MODEL),
    schema: interviewQuestionSchema,
    prompt: buildQuestionPrompt(plan.topics, profile.rawLlmJson, session.jdText, session.resumeText, transcriptStr, isFollowUp, session.company, session.role),
    temperature: 0.6,
  });

  const [question] = await db.insert(interviewQuestions).values({
    sessionId,
    topic: currentTopic,
    prompt: object.question,
    reason: object.reason,
    orderIndex: questions.length + 1,
    parentQuestionId,
  }).returning();

  await db.update(interviewSessions).set({ status: "INTERVIEW_LOOP" }).where(eq(interviewSessions.id, sessionId));

  return question;
}

export async function submitAnswer(questionId: string, content: string, inputMode: string) {
  const [answer] = await db.insert(interviewAnswers).values({
    questionId,
    content,
    inputMode,
  }).returning();
  return answer;
}

export async function evaluateAnswer(answerId: string) {
  const answer = await db.query.interviewAnswers.findFirst({ where: eq(interviewAnswers.id, answerId) });
  if (!answer) throw new Error("Answer not found");

  const question = await db.query.interviewQuestions.findFirst({ where: eq(interviewQuestions.id, answer.questionId) });
  if (!question) throw new Error("Question not found");

  const session = await db.query.interviewSessions.findFirst({ where: eq(interviewSessions.id, question.sessionId) });

  const { object } = await generateObject({
    model: groq(INTERVIEW_MODEL),
    schema: interviewEvaluationSchema,
    prompt: buildEvaluationPrompt(question.prompt, answer.content, session!.jdText),
    temperature: 0.2,
  });

  const [evaluation] = await db.insert(interviewEvaluations).values({
    answerId,
    score: object.score,
    feedback: object.feedback,
    triggeredFollowup: object.triggeredFollowup,
  }).returning();

  return evaluation;
}

export async function generateReport(sessionId: string) {
  const session = await db.query.interviewSessions.findFirst({ where: eq(interviewSessions.id, sessionId) });
  const profile = await db.query.candidateProfiles.findFirst({ where: eq(candidateProfiles.sessionId, sessionId) });

  const questions = await db.query.interviewQuestions.findMany({ where: eq(interviewQuestions.sessionId, sessionId) });
  const answers = questions.length > 0
    ? await db.query.interviewAnswers.findMany({ where: inArray(interviewAnswers.questionId, questions.map(q => q.id)) })
    : [];
  const evaluations = answers.length > 0
    ? await db.query.interviewEvaluations.findMany({ where: inArray(interviewEvaluations.answerId, answers.map(a => a.id)) })
    : [];

  // Calculate scores
  let totalScore = 0;
  const topicBreakdown: Record<string, { total: number, count: number }> = {};

  let transcriptStr = "";
  for (const q of questions) {
    transcriptStr += `\nInterviewer [${q.topic}]: ${q.prompt}`;
    const ans = answers.find(a => a.questionId === q.id);
    if (ans) {
      transcriptStr += `\nCandidate: ${ans.content}`;
      const ev = evaluations.find(e => e.answerId === ans.id);
      if (ev) {
        const feedbackObj = ev.feedback as { strengths: string[], gaps: string[] };
        transcriptStr += `\nEval: Score ${ev.score}, Strengths: ${feedbackObj.strengths.join(", ")}`;
        totalScore += ev.score;
        if (!topicBreakdown[q.topic]) topicBreakdown[q.topic] = { total: 0, count: 0 };
        topicBreakdown[q.topic].total += ev.score;
        topicBreakdown[q.topic].count += 1;
      }
    }
  }

  const overallScore = evaluations.length > 0 ? Math.round((totalScore / evaluations.length) * 20) : 0; // out of 100
  const finalTopicBreakdown = Object.entries(topicBreakdown).map(([topic, stats]) => ({
    topic,
    score: Math.round((stats.total / stats.count) * 20)
  }));

  const { object } = await generateObject({
    model: groq(INTERVIEW_MODEL),
    schema: interviewReportSchema,
    prompt: buildReportPrompt(profile?.rawLlmJson, transcriptStr, session!.jdText),
    temperature: 0.3,
  });

  const [report] = await db.insert(interviewReports).values({
    sessionId,
    overallScore,
    topicBreakdown: finalTopicBreakdown,
    summary: object.summary,
  }).returning();

  return report;
}
