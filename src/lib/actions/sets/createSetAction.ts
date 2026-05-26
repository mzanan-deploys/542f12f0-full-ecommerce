"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import slugify from "slugify";

import { db } from "@/db";
import { setImages, sets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/authz";
import { extractImageFilesFromFormData } from "@/lib/helpers/formHelpers";
import {
  deleteFileByPath,
  uploadCollectionImage,
} from "@/lib/helpers/storageHelpers";
import { createSetFormSchema } from "@/lib/schemas/setSchema";
import type { ActionResponse } from "@/types/actions";
import type { SetRow } from "@/types/db";
import type { UploadedSetImageInfo } from "@/types/setActions";

export async function createSetAction(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse<SetRow>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const uploadedImagePathsToRollback: string[] = [];

  const isActive = formData.get("is_active") === "on";
  const showTitleOnHome = formData.get("show_title_on_home") === "on";
  const newImageFiles = extractImageFilesFromFormData(formData);
  const imageOrderJson = formData.get("imageOrder") as string;

  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug") || null,
    description: formData.get("description") || "",
    is_active: isActive,
    show_title_on_home: showTitleOnHome,
    type: formData.get("type"),
    layout_type: formData.get("layout_type"),
    images: newImageFiles,
  };

  const validation = createSetFormSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: `Validation failed: ${JSON.stringify(validation.error.flatten().fieldErrors)}`,
    };
  }
  if (!imageOrderJson) {
    return { success: false, error: "Image order information is missing." };
  }

  const imageOrderClient: string[] = JSON.parse(imageOrderJson);

  const {
    slug: providedSlug,
    name,
    type,
    layout_type,
    is_active,
    show_title_on_home,
    description,
  } = validation.data;
  const finalSlug = providedSlug || slugify(name, { lower: true, strict: true });

  const uploadedImagesMap = new Map<string, UploadedSetImageInfo>();
  let createdSetId: string | null = null;

  try {
    if (newImageFiles.length > 0) {
      await Promise.all(
        newImageFiles.map(async (file: File) => {
          const matches = Array.from(file.name.matchAll(/(temp-[0-9a-fA-F-]+)___/g));
          const tempId = matches.length > 0 ? matches[matches.length - 1][1] : null;
          if (!tempId) throw new Error(`Internal error: tempId missing for ${file.name}`);

          const uploadResult = await uploadCollectionImage(file);
          if (uploadResult.error || !uploadResult.publicUrl || !uploadResult.path) {
            throw new Error(uploadResult.error || `Failed to upload image ${file.name}`);
          }
          uploadedImagesMap.set(tempId, {
            tempId,
            url: uploadResult.publicUrl,
            path: uploadResult.path,
          });
          uploadedImagePathsToRollback.push(uploadResult.path);
        }),
      );
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
        showTitleOnHome: show_title_on_home,
      })
      .returning({ id: sets.id, slug: sets.slug });

    if (!newSet) throw new Error("Set created but ID not returned.");
    createdSetId = newSet.id;

    const finalImageRecords: Array<{ setId: string; imageUrl: string; position: number }> = [];
    if (uploadedImagesMap.size > 0) {
      if (imageOrderClient.length > 0) {
        imageOrderClient.forEach((idOrTempId, index) => {
          if (idOrTempId.startsWith("temp-")) {
            const uploaded = uploadedImagesMap.get(idOrTempId);
            if (!uploaded) throw new Error(`Image data mismatch for ${idOrTempId}.`);
            finalImageRecords.push({
              setId: createdSetId!,
              imageUrl: uploaded.url,
              position: index,
            });
          }
        });
      } else {
        Array.from(uploadedImagesMap.values()).forEach((uploaded, index) => {
          finalImageRecords.push({
            setId: createdSetId!,
            imageUrl: uploaded.url,
            position: index,
          });
        });
      }
    }

    if (finalImageRecords.length > 0) {
      await db.insert(setImages).values(finalImageRecords);
    }

    if (createdSetId && is_active) {
      try {
        const { syncHomepageLayout } = await import("@/lib/actions/layoutActions");
        await syncHomepageLayout("/");
      } catch (layoutError) {
        console.error("[createSetAction] homepage sync failed", layoutError);
      }
    }

    revalidateTag("sets", "default");
    revalidatePath("/admin/sets");
    revalidatePath("/admin/home-design");
    revalidatePath("/");
    if (newSet.slug) {
      revalidateTag(`set-${newSet.slug}`, "default");
      revalidatePath(`/set/${newSet.slug}`);
    }

    return {
      success: true,
      message: `Set "${name}" created successfully!`,
      data: { id: createdSetId!, slug: newSet.slug, name } as unknown as SetRow,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (uploadedImagePathsToRollback.length > 0) {
      await Promise.allSettled(uploadedImagePathsToRollback.map((p) => deleteFileByPath(p)));
    }
    if (createdSetId) {
      try {
        await db.delete(setImages).where(eq(setImages.setId, createdSetId));
        await db.delete(sets).where(eq(sets.id, createdSetId));
      } catch (cleanupError) {
        console.error("[createSetAction] cleanup failed", cleanupError);
      }
    }
    if (message.includes("duplicate") && message.includes("slug")) {
      return { success: false, error: `Set slug '${finalSlug}' already exists.` };
    }
    return { success: false, error: `Failed to create set: ${message}` };
  }
}
