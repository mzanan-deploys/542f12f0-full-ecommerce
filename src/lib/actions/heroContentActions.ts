"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { heroContent } from "@/db/schema";
import { heroContentSelector } from "@/lib/db/selectors";
import { requireAdmin } from "@/lib/auth/authz";
import { extractImageFilesFromFormData } from "@/lib/helpers/formHelpers";
import {
  deleteHeroImage,
  getStoragePathFromUrl,
  uploadHeroImage,
} from "@/lib/helpers/storageHelpers";
import { heroContentFormSchema, HERO_CONTENT_ID } from "@/lib/schemas/heroSchema";
import type { ActionResponse } from "@/types/actions";
import type { HeroDbRow } from "@/types/hero";

export async function upsertHeroContentAction(
  prevState: ActionResponse<HeroDbRow> | null,
  formData: FormData,
): Promise<ActionResponse<HeroDbRow>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const imageFiles = extractImageFilesFromFormData(formData);
  const currentImageUrl = formData.get("current_image_url") as string | null;

  const validated = heroContentFormSchema.safeParse({
    id: String(HERO_CONTENT_ID),
    images: imageFiles.length > 0 ? imageFiles[0] : undefined,
    image_url: currentImageUrl || undefined,
    imageOrderChanged: formData.get("imageOrderChanged") === "true",
  });

  if (!validated.success) {
    return {
      success: false,
      message: "Invalid form data.",
      error: JSON.stringify(validated.error.flatten().fieldErrors),
    };
  }

  let imageUrl = validated.data.image_url || null;
  let uploadedImagePath: string | null = null;

  try {
    if (imageFiles.length > 0) {
      const uploadResult = await uploadHeroImage(imageFiles[0]);
      if (uploadResult.error || !uploadResult.publicUrl || !uploadResult.path) {
        throw new Error(uploadResult.error || "Image upload failed");
      }
      if (currentImageUrl && currentImageUrl !== uploadResult.publicUrl) {
        const oldPath = getStoragePathFromUrl(currentImageUrl);
        if (oldPath) await deleteHeroImage(oldPath);
      }
      imageUrl = uploadResult.publicUrl;
      uploadedImagePath = uploadResult.path;
    }

    await db
      .insert(heroContent)
      .values({
        id: HERO_CONTENT_ID,
        imageUrl,
        title: "",
        subtitle: "",
      })
      .onConflictDoUpdate({
        target: heroContent.id,
        set: {
          imageUrl,
          title: "",
          subtitle: "",
          updatedAt: sql`now()`,
        },
      });

    const [result] = await db
      .select(heroContentSelector)
      .from(heroContent)
      .where(sql`${heroContent.id} = ${HERO_CONTENT_ID}`)
      .limit(1);

    revalidatePath("/");
    revalidatePath("/admin/hero-settings");
    return {
      success: true,
      message: "Hero image updated successfully.",
      data: result as unknown as HeroDbRow,
    };
  } catch (e) {
    if (uploadedImagePath) await deleteHeroImage(uploadedImagePath);
    const message = e instanceof Error ? e.message : "Failed to save hero content.";
    return { success: false, message };
  }
}
