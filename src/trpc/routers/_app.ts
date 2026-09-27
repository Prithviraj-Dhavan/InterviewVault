import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { answersRouter } from "./answers";
import { companiesRouter } from "./companies";
import { questionRouter } from "./questions";
import { rolesRouter } from "./roles";
import { votesRouter } from "./votes";
export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => ({
      greeting: `hello ${opts.input.text}`,
    })),
  questions: questionRouter,
  companies: companiesRouter,
  roles: rolesRouter,
  answers: answersRouter,
  votes: votesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
