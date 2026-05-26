"use server";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/authz";
import type { ActionResponse } from "@/types/actions";
import type { UpdateSettingResult } from "@/types/settings";

export async function getSetting(
  key: string,
): Promise<ActionResponse<{ key: string; value: string | null }>> {
  try {
    const [row] = await db
      .select({ key: appSettings.key, value: appSettings.value })
      .from(appSettings)
      .where(eq(appSettings.key, key))
      .limit(1);
    if (!row) return { success: false, error: "Setting not found" };
    return { success: true, data: row };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function updateSetting(key: string, value: string): Promise<UpdateSettingResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Permission denied. Ensure you are an administrator." };
  }
  try {
    await db
      .insert(appSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value: sql`EXCLUDED.value` },
      });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
