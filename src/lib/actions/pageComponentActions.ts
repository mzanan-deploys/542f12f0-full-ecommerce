"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { db } from "@/db";
import { pageComponents } from "@/db/schema";
import { pageComponentSelector } from "@/lib/db/selectors";
import { requireAdmin, verifyAdmin } from "@/lib/auth/serverAuth";
import type { ActionResponse } from "@/types/actions";
import type { PageComponentContent } from "@/types/db";
import type { OrderUpdate } from "@/types/pageComponent";

export async function updatePageComponentOrder(updates: OrderUpdate[]): Promise<ActionResponse> {
  if (!updates || updates.length === 0) {
    return { success: true, message: "No updates provided." };
  }
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized." };
  }

  try {
    let successfulUpdates = 0;
    for (const update of updates) {
      if (!update) continue;
      await db
        .update(pageComponents)
        .set({ displayOrder: update.display_order })
        .where(eq(pageComponents.id, update.id));
      successfulUpdates++;
    }

    revalidatePath("/");
    revalidateTag("page-components", "default");
    return {
      success: true,
      message: `Successfully updated order for ${successfulUpdates} components.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Failed to save order: ${message}` };
  }
}

export async function updatePageComponent(
  id: string,
  updates: { content?: PageComponentContent; affiliation?: string },
): Promise<{ success: boolean; message?: string; data?: unknown }> {
  if (!id) return { success: false, message: "Component ID is required." };

  if (!(await verifyAdmin())) {
    return { success: false, message: "Admin authorization required." };
  }

  const updateData: Record<string, unknown> = {};
  if (updates.content) updateData.content = updates.content;
  if (updates.affiliation) updateData.affiliation = updates.affiliation;

  if (Object.keys(updateData).length === 0) {
    return { success: false, message: "No valid update fields provided." };
  }
  updateData.updatedAt = new Date();

  try {
    const [existing] = await db
      .select({ type: pageComponents.type })
      .from(pageComponents)
      .where(eq(pageComponents.id, id))
      .limit(1);

    if (existing?.type === "about") {
      return {
        success: false,
        message: "Cannot update 'about' components here. Use the About admin page.",
      };
    }

    await db.update(pageComponents).set(updateData).where(eq(pageComponents.id, id));
    const [updated] = await db
      .select(pageComponentSelector)
      .from(pageComponents)
      .where(eq(pageComponents.id, id))
      .limit(1);

    revalidatePath("/");
    revalidatePath("/admin/home-design");
    return { success: true, message: "Page component updated.", data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Database Error: ${message}` };
  }
}
