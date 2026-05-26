"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

import { db } from "@/db";
import { setImages, sets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/authz";
import { extractImageFilesFromFormData } from "@/lib/helpers/formHelpers";
import {
  deleteCollectionImage,
  uploadCollectionImage,
} from "@/lib/helpers/storageHelpers";
import { createSetFormSchema } from "@/lib/schemas/setSchema";
import type { ActionResponse as BaseActionResponse } from "@/types/actions";
import type { SetRow } from "@/types/db";

export async function createSetAction(
  formData: FormData,
): Promise<BaseActionResponse<SetRow>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "User not authenticated." };
  }

  const imageFiles = extractImageFilesFromFormData(formData);
  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug") || null,
    description: formData.get("description") || "",
    type: formData.get("type"),
    layout_type: formData.get("layout_type"),
    is_active: formData.get("is_active") === "on",
    images: imageFiles,
  };

  const validation = createSetFormSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: `Validation failed: ${JSON.stringify(validation.error.flatten().fieldErrors)}`,
    };
  }

  const { images, slug: providedSlug, name, type, layout_type, is_active, description } = validation.data;
  const finalSlug = providedSlug || slugify(name, { lower: true, strict: true });

  const uploadedImagePaths: string[] = [];
  const uploadedImageResults: Array<{ publicUrl: string; path: string }> = [];
  let createdSetId: string | null = null;

  try {
    for (const imageFile of images) {
      const uploadResult = await uploadCollectionImage(imageFile);
      if (uploadResult.error || !uploadResult.publicUrl || !uploadResult.path) {
        throw new Error(`Image upload failed: ${uploadResult.error || imageFile.name}`);
      }
      uploadedImageResults.push({ publicUrl: uploadResult.publicUrl, path: uploadResult.path });
      uploadedImagePaths.push(uploadResult.path);
    }

    const [newSet] = await db
      .insert(sets)
      .values({
        name,
        slug: finalSlug,
        description,
        type,
        layoutType: layout_type,
        isActive: is_active,
      })
      .returning({ id: sets.id, slug: sets.slug });

    if (!newSet) throw new Error("Set created but ID not returned.");
    createdSetId = newSet.id;

    if (uploadedImageResults.length > 0) {
      await db.insert(setImages).values(
        uploadedImageResults.map((img, index) => ({
          setId: createdSetId!,
          imageUrl: img.publicUrl,
          position: index,
        })),
      );
    }

    revalidatePath("/admin/sets");
    revalidatePath("/");
    if (newSet.slug) revalidatePath(`/set/${newSet.slug}`);

    return {
      success: true,
      message: "Set created successfully",
      data: { id: createdSetId, slug: newSet.slug } as unknown as SetRow,
    };
  } catch (error) {
    if (uploadedImagePaths.length > 0) {
      await Promise.allSettled(uploadedImagePaths.map((p) => deleteCollectionImage(p)));
    }
    if (createdSetId) {
      await db.delete(sets).where(eq(sets.id, createdSetId)).catch(() => {});
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("duplicate") && message.includes("slug")) {
      return { success: false, error: `Set slug '${finalSlug}' already exists.` };
    }
    return { success: false, error: `Error creating set: ${message}` };
  }
}
