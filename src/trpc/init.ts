import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";

export const createTRPCContext = cache(async () => {
  const { session } = (await auth.api.getSession({
    headers: await headers(),
  })) ?? { user: null, session: null };
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { session };
});

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const privateProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Please login" });
  }
  return await next({
    ctx: {
      session: ctx.session,
    },
  });
});
