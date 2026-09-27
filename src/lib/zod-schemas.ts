/** biome-ignore-all lint/style/noMagicNumbers: Strict rule not needed */
import z from "zod";

export const postQuestionSchema = z.object({
  title: z.string(),
  description: z.string(),
  role: z.string(),
  company: z.string(),
  tags: z.array(z.string()),
});

// Used by the "Post a Question" form (server action)
export const createQuestionFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be at most 5000 characters"),
  company: z.uuid("Please select a company"),
  role: z.uuid().optional(),
});

const MAX_LENGTH = 30;
const LIMIT = 30;

export const getQuestionsInputSchema = z.object({
  search: z.string().min(2).max(MAX_LENGTH).optional().nullable(),
  role: z.uuid().optional().nullable(),
  company: z.uuid().optional().nullable(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(LIMIT).optional().default(10),
});

export const getQuestionInputSchema = z.object({
  id: z.uuid(),
});

export const completionsSchema = z.object({
  prompt: z.string(),
  questionId: z.uuid(),
});

// The evaluate endpoint only needs the answer id; the question and answer
// text are always read from the database, never trusted from the client.
export const evaluateAnswerSchema = z.object({
  answerId: z.uuid(),
});

export const answerSchema = z.object({
  content: z
    .string()
    .min(2)
    .max(5000, "Answer must be between 2 and 5000 characters"),
  questionId: z.uuid(),
});

export const aiEvaluationSchema = z.object({
  score: z.number().min(0).max(10).describe("Score from 0 to 10"),
  verdict: z.string().min(1).max(1000).describe("Verdict of the answer"),
  strengths: z.array(z.string()).describe("Strengths of the answer"),
  issues: z.array(z.string()).describe("Issues with the answer"),
  suggestions: z.array(z.string()).describe("Suggestions for improvement"),
  isCorrect: z.boolean(),
});

export type AIEvaluation = z.infer<typeof aiEvaluationSchema>;
