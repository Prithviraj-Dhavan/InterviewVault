import { z } from "zod";

export const candidateProfileSchema = z.object({
  level: z.string().describe("E.g., junior, mid, senior"),
  skills: z.array(z.string()).describe("List of core skills found in the resume matching the job description"),
  gaps: z.array(z.string()).describe("Explicit skill gaps or missing requirements between resume and job description"),
  projects: z.array(z.string()).describe("List of key projects mentioned in the resume"),
  experience: z.array(z.string()).describe("List of internships or work experience mentioned in the resume"),
});

export const interviewPlanSchema = z.object({
  topics: z.array(
    z.object({
      topic: z.string().describe("The name of the topic to cover"),
      weight: z.number().min(0).max(1).describe("Weight/importance of this topic (0.0 to 1.0)"),
      question_count: z.number().int().min(1).describe("Target number of questions to ask for this topic"),
    })
  ),
});

export const interviewQuestionSchema = z.object({
  question: z.string().describe("The interview question to ask"),
  reason: z.string().describe("Why this question was chosen (which resume line, JD requirement, or profile gap it targets)."),
});

export const interviewEvaluationSchema = z.object({
  score: z.number().int().min(1).max(5).describe("Score of the answer from 1 to 5"),
  feedback: z.object({
    strengths: z.array(z.string()).describe("What the candidate did well in this answer"),
    gaps: z.array(z.string()).describe("What was missing or incorrect in this answer"),
  }),
  triggeredFollowup: z.boolean().describe("True if a follow-up question is recommended based on the gaps in this answer (typically if score is < 4 and more probing is needed)."),
});

export const interviewReportSchema = z.object({
  summary: z.string().describe("A comprehensive narrative summary of the candidate's performance across the entire interview."),
});
