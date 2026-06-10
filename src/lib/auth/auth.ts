import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { APIError } from "better-auth/api";
import { count } from "drizzle-orm";

import { db } from "@/db";
import { account, adminUsers, session, user, verification } from "@/db/schema";

function createAuth() {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { user, session, account, verification },
    }),
    emailAndPassword: { enabled: true },
    databaseHooks: {
      user: {
        create: {
          before: async (newUser) => {
            const [{ value }] = await db.select({ value: count() }).from(user);
            if (value > 0) {
              throw new APIError("FORBIDDEN", {
                message: "Sign up is disabled. This store already has an admin.",
              });
            }
            return { data: newUser };
          },
          after: async (createdUser) => {
            await db
              .insert(adminUsers)
              .values({ id: createdUser.id, fullName: createdUser.name })
              .onConflictDoNothing();
          },
        },
      },
    },
    plugins: [nextCookies()],
  });
}

type Auth = ReturnType<typeof createAuth>;

let cachedAuth: Auth | null = null;

export function getAuth(): Auth {
  if (!cachedAuth) cachedAuth = createAuth();
  return cachedAuth;
}
