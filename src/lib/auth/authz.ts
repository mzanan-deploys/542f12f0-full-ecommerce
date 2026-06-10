import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { getAuth } from "@/lib/auth/auth";

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getAuth().api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("UNAUTHENTICATED");
  }
  return userId;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.id, userId))
    .limit(1);
  return rows.length > 0;
}

export async function requireAdmin(): Promise<string> {
  const userId = await requireAuth();
  const ok = await isAdmin(userId);
  if (!ok) {
    throw new Error("FORBIDDEN");
  }
  return userId;
}
