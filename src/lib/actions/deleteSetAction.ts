"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { db } from "@/db";
import { setImages, setProducts, sets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/authz";
import { deleteCollectionImage } from "@/lib/helpers/storageHelpers";
import type { ActionResponse as BaseActionResponse } from "@/types/actions";

export async function deleteSetAction(setId: string): Promise<BaseActionResponse> {
  try {
    await requireAdmin();

    const [set] = await db
      .select({ id: sets.id, slug: sets.slug })
      .from(sets)
      .where(eq(sets.id, setId))
      .limit(1);

    if (!set) {
      revalidateTag("sets", "default");
      revalidatePath("/admin/sets");
      return { success: true, message: "Set already deleted or not found." };
    }

    const images = await db
      .select({ id: setImages.id, imageUrl: setImages.imageUrl })
      .from(setImages)
      .where(eq(setImages.setId, setId));

    if (images.length > 0) {
      await Promise.allSettled(images.map((img) => deleteCollectionImage(img.imageUrl)));
      await db.delete(setImages).where(
        inArray(
          setImages.id,
          images.map((img) => img.id),
        ),
      );
    }

    await db.delete(setProducts).where(eq(setProducts.setId, setId));
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
