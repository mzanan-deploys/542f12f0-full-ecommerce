"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { heroContent } from "@/db/schema";
import { heroContentSelector } from "@/lib/db/selectors";
import { requireAdmin } from "@/lib/auth/authz";
import { deleteHeroImage, getStoragePathFromUrl } from "@/lib/helpers/storageHelpers";
import { HERO_CONTENT_ID } from "@/lib/schemas/heroSchema";
import type { ActionResponse } from "@/types/actions";
import type { HeroDbRow } from "@/types/hero";

export async function deleteHeroImageAction(): Promise<ActionResponse<HeroDbRow>> {
  try {
    await requireAdmin();

    const [current] = await db
      .select(heroContentSelector)
      .from(heroContent)
      .where(eq(heroContent.id, HERO_CONTENT_ID))
      .limit(1);

    if (current?.image_url) {
      const path = getStoragePathFromUrl(current.image_url);
      if (path) await deleteHeroImage(path);
    }

    await db
      .insert(heroContent)
      .values({ id: HERO_CONTENT_ID, imageUrl: null, title: "", subtitle: "" })
      .onConflictDoUpdate({
        target: heroContent.id,
        set: { imageUrl: null, title: "", subtitle: "", updatedAt: sql`now()` },
      });

    const [result] = await db
      .select(heroContentSelector)
      .from(heroContent)
      .where(eq(heroContent.id, HERO_CONTENT_ID))
      .limit(1);

    revalidatePath("/");
    revalidatePath("/admin/hero-settings");
    return {
      success: true,
      message: "Hero image deleted successfully.",
      data: result as unknown as HeroDbRow,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete hero image.";
    return { success: false, error: message };
  }
}
