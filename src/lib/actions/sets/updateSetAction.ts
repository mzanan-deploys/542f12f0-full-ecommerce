"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db";
import { setImages, sets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/authz";
import {
  deleteCollectionImage,
  uploadCollectionImage,
} from "@/lib/helpers/storageHelpers";
import { updateSetFormSchema } from "@/lib/schemas/setSchema";
import type { ActionResponse } from "@/types/actions";

type UploadedImage = {
  publicUrl: string | null;
  path: string | null;
  tempId?: string | null;
  error: string | null;
};

async function handleSetImageUploads(
  setId: string,
  formData: FormData,
  deleteImageIds: string[] = [],
): Promise<ActionResponse> {
  const imageFiles = formData
    .getAll("images")
    .filter((img) => img instanceof File && img.size > 0) as File[];
  const imageOrderJson = formData.get("imageOrder") as string;
  const finalImageOrderIds: string[] = imageOrderJson ? JSON.parse(imageOrderJson) : [];

  if (deleteImageIds.length > 0) {
    await db.delete(setImages).where(inArray(setImages.id, deleteImageIds));
  }

  try {
    const uploadedImagesData: UploadedImage[] = [];
    if (imageFiles.length > 0) {
      const uploads = await Promise.allSettled(
        imageFiles.map(async (file) => {
          const matches = Array.from(file.name.matchAll(/(temp-[0-9a-fA-F-]+)___/g));
          const tempId =
            matches.length > 0 ? matches[matches.length - 1][1] : `temp-${uuidv4()}`;
          const uploadResult = await uploadCollectionImage(file);
          return { ...uploadResult, tempId };
        }),
      );

      const successful: UploadedImage[] = [];
      const failures: string[] = [];
      uploads.forEach((r, idx) => {
        if (r.status === "fulfilled" && !r.value.error) successful.push(r.value);
        else failures.push(`${imageFiles[idx]?.name || idx}: ${r.status === "rejected" ? r.reason : r.value.error}`);
      });

      if (failures.length > 0) {
        const rollbackPaths = successful.map((s) => s.path).filter(Boolean) as string[];
        if (rollbackPaths.length > 0) {
          await Promise.allSettled(rollbackPaths.map((p) => deleteCollectionImage(p)));
        }
        return { success: false, error: `Failed to upload images: ${failures.join(", ")}` };
      }
      uploadedImagesData.push(...successful);
    }

    if (uploadedImagesData.length > 0) {
      const existing = await db
        .select({
          id: setImages.id,
          position: setImages.position,
          imageUrl: setImages.imageUrl,
        })
        .from(setImages)
        .where(eq(setImages.setId, setId));
      const existingMap = new Map(existing.map((img) => [img.id, img]));
      const existingUrlSet = new Set(existing.map((img) => img.imageUrl));

      const insertData: Array<{ setId: string; imageUrl: string; position: number }> = [];
      const updates: Array<{ id: string; position: number }> = [];

      if (finalImageOrderIds.length > 0) {
        finalImageOrderIds.forEach((id, index) => {
          if (id.startsWith("temp-")) {
            const uploaded = uploadedImagesData.find((img) => img.tempId === id);
            if (uploaded?.publicUrl && !existingUrlSet.has(uploaded.publicUrl)) {
              insertData.push({ setId, imageUrl: uploaded.publicUrl, position: index });
            }
          } else {
            const existingImg = existingMap.get(id);
            if (existingImg && existingImg.position !== index) {
              updates.push({ id, position: index });
            }
          }
        });
      } else {
        uploadedImagesData.forEach((uploaded, index) => {
          if (uploaded?.publicUrl && !existingUrlSet.has(uploaded.publicUrl)) {
            insertData.push({ setId, imageUrl: uploaded.publicUrl, position: index });
          }
        });
      }

      if (insertData.length > 0) await db.insert(setImages).values(insertData);
      for (const u of updates) {
        await db.update(setImages).set({ position: u.position }).where(eq(setImages.id, u.id));
      }
    } else if (finalImageOrderIds.length > 0) {
      const existing = await db
        .select({ id: setImages.id, position: setImages.position })
        .from(setImages)
        .where(eq(setImages.setId, setId));
      const existingMap = new Map(existing.map((img) => [img.id, img]));

      const updates: Array<{ id: string; position: number }> = [];
      finalImageOrderIds.forEach((id, index) => {
        const existingImg = existingMap.get(id);
        if (existingImg && existingImg.position !== index) {
          updates.push({ id, position: index });
        }
      });
      for (const u of updates) {
        await db.update(setImages).set({ position: u.position }).where(eq(setImages.id, u.id));
      }
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown image handling error";
    return { success: false, error: message };
  }
}

export async function updateSetAction(
  setId: string,
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse<{ id: string }>> {
  if (!setId) return { success: false, error: "Set ID is missing." };

  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const isActive = formData.get("is_active") === "on";
  const showTitleOnHome = formData.get("show_title_on_home") === "on";
  const imageFiles = formData
    .getAll("images")
    .filter((img) => img instanceof File && img.size > 0) as File[];

  const rawData = {
    id: setId,
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || "",
    is_active: isActive,
    show_title_on_home: showTitleOnHome,
    type: formData.get("type"),
    layout_type: formData.get("layout_type"),
    images: imageFiles,
  };

  const validation = updateSetFormSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: `Validation failed: ${JSON.stringify(validation.error.flatten().fieldErrors)}`,
    };
  }

  const { name, slug, type, description, layout_type, is_active, show_title_on_home } =
    validation.data;
  const deleteImageIds = formData.getAll("deleteImageIds").map(String);

  const existingCountRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(setImages)
    .where(eq(setImages.setId, setId));
  const existingImageCount = existingCountRows[0]?.count ?? 0;
  const finalImageCount = existingImageCount - deleteImageIds.length + imageFiles.length;

  let requiredImages = 0;
  switch (layout_type) {
    case "SINGLE_COLUMN":
      requiredImages = 1;
      break;
    case "SPLIT_SMALL_LEFT":
    case "SPLIT_SMALL_RIGHT":
      requiredImages = 2;
      break;
    case "STAGGERED_THREE":
      requiredImages = 3;
      break;
  }

  if (finalImageCount < requiredImages) {
    const errorMessage = `${layout_type.replace(/_/g, " ").toLowerCase()} layout requires at least ${requiredImages} image(s). After changes, there would be ${finalImageCount}.`;
    return {
      success: false,
      message: errorMessage,
      error: JSON.stringify({ layout_type: [errorMessage] }),
    };
  }

  try {
    await db
      .update(sets)
      .set({
        name,
        slug,
        type,
        description,
        layoutType: layout_type,
        isActive: is_active,
        showTitleOnHome: show_title_on_home,
        updatedAt: new Date(),
      })
      .where(eq(sets.id, setId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update set.";
    if (message.includes("duplicate") && message.includes("slug")) {
      return { success: false, error: "Slug already exists" };
    }
    return { success: false, error: message };
  }

  const imageResult = await handleSetImageUploads(setId, formData, deleteImageIds);
  if (!imageResult.success) {
    return {
      success: false,
      message: `Set updated, but image processing failed: ${imageResult.error}`,
      error: imageResult.error,
    };
  }

  revalidatePath("/admin/sets");
  revalidatePath(`/admin/sets/${setId}/edit`);
  return { success: true, message: "Set updated successfully.", data: { id: setId } };
}
