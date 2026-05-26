"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { db } from "@/db";
import { sets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/authz";
import type { ActionResponse } from "@/types/actions";

export async function deleteSetAction(setId: string): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const [set] = await db
      .select({ id: sets.id, slug: sets.slug })
      .from(sets)
      .where(eq(sets.id, setId))
      .limit(1);
    if (!set) return { success: true, message: "Set already deleted or not found." };

    await db.delete(sets).where(eq(sets.id, setId));

    revalidateTag("sets", "default");
    revalidatePath("/admin/sets");
    revalidatePath("/");
    if (set.slug) {
      revalidateTag(`set-${set.slug}`, "default");
      revalidatePath(`/set/${set.slug}`);
    }
    return { success: true, message: "Set deleted successfully" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Error deleting set: ${message}` };
  }
}
