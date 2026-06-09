import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let cachedDb: DrizzleDb | null = null;

function createDb(): DrizzleDb {
  const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Database not configured. Install the Neon integration in your Vercel project, or set POSTGRES_URL.",
    );
  }
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    if (!cachedDb) cachedDb = createDb();
    return Reflect.get(cachedDb, prop, receiver);
  },
});

export type Db = DrizzleDb;
