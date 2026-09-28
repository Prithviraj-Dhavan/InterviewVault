import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env";
import * as authSchema from "./schema/auth";
import * as interviewSchema from "./schema/interview";
import * as questionsSchema from "./schema/questions";
import * as votesSchema from "./schema/votes";

const sql = neon(env.DATABASE_URL);
export const db = drizzle({ client: sql, schema: { ...authSchema, ...interviewSchema, ...questionsSchema, ...votesSchema } });
