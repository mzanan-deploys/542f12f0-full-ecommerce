"use server";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { appSettings } from "@/db/schema";
import {
  deleteFileByPath,
  getStoragePathFromUrl,
  uploadAboutImage,
} from "@/lib/helpers/storageHelpers";
import { requireAdmin } from "@/lib/auth/authz";
import { APP_SETTINGS_ABOUT_KEY } from "@/lib/constants/home";
import type { AboutContentData, UploadedImageInfo } from "@/types/about";

async function readAboutSetting(): Promise<AboutContentData | null> {
  const [row] = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, APP_SETTINGS_ABOUT_KEY))
    .limit(1);
  if (!row?.value || typeof row.value !== "string") return null;
  try {
    return JSON.parse(row.value) as AboutContentData;
  } catch {
    return null;
  }
}

export async function fetchAboutContentAction(): Promise<{
  data: AboutContentData | null;
  error: string | null;
}> {
  try {
    const content = await readAboutSetting();
    if (!content) {
      return {
        data: { text_content: null, image_urls: [], image_aspect_ratio: "square" },
        error: null,
      };
    }
    return {
      data: {
        text_content: content.text_content || null,
        image_urls: Array.isArray(content.image_urls)
          ? content.image_urls.filter((img) => typeof img === "string" || img === null)
          : [],
        image_aspect_ratio: content.image_aspect_ratio || "square",
      },
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: `Failed to load about content: ${message}` };
  }
}

export async function saveAboutContentAction(
  formData: FormData,
): Promise<{ success: boolean; error: string | null; data?: AboutContentData }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const uploadedImagePathsToRollback: string[] = [];

  try {
    const text_content = (formData.get("text_content") as string) || null;
    const imageOrderJson = formData.get("imageOrder") as string;
    const deleteImageIds = formData.getAll("deleteImageIds") as string[];
    const newImageFiles = formData.getAll("images") as File[];
    const image_aspect_ratio =
      (formData.get("image_aspect_ratio") as "square" | "portrait" | "video") || "square";

    if (!text_content || text_content.trim() === "") {
      return { success: false, error: "Text content is required." };
    }
    if (!imageOrderJson) throw new Error("Image order information is missing.");
    const imageOrder: string[] = JSON.parse(imageOrderJson);

    const current = await readAboutSetting();
    const oldImageUrls: string[] = Array.isArray(current?.image_urls)
      ? current!.image_urls.filter((u): u is string => typeof u === "string")
      : [];

    const uploadedMap = new Map<string, UploadedImageInfo>();
    if (newImageFiles.length > 0) {
      await Promise.all(
        newImageFiles.map(async (file) => {
          const match = file.name.match(/^(temp-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}))___/i);
          const tempId = match ? match[1] : null;
          if (!tempId) {
            throw new Error(`Internal error: tempId missing for ${file.name}.`);
          }
          const uploadResult = await uploadAboutImage(file);
          if (uploadResult.error || !uploadResult.publicUrl || !uploadResult.path) {
            throw new Error(uploadResult.error || `Failed to upload image ${file.name}`);
          }
          uploadedMap.set(tempId, {
            tempId,
            url: uploadResult.publicUrl,
            path: uploadResult.path,
          });
          uploadedImagePathsToRollback.push(uploadResult.path);
        }),
      );
    }

    const finalImageUrls: string[] = imageOrder.map((idOrTempId) => {
      if (idOrTempId.startsWith("temp-")) {
        const uploaded = uploadedMap.get(idOrTempId);
        if (!uploaded) throw new Error(`Missing uploaded image data for tempId: ${idOrTempId}.`);
        return uploaded.url;
      }
      return idOrTempId;
    });

    if (finalImageUrls.filter((url) => url).length === 0) {
      return { success: false, error: "At least one image is required after processing." };
    }

    const finalSet = new Set(finalImageUrls);
    const pathsToDelete = new Set<string>();
    for (const idToDelete of deleteImageIds) {
      const path = getStoragePathFromUrl(idToDelete);
      if (path) pathsToDelete.add(path);
    }
    for (const oldUrl of oldImageUrls) {
      if (!finalSet.has(oldUrl) && !deleteImageIds.includes(oldUrl)) {
        const path = getStoragePathFromUrl(oldUrl);
        if (path) pathsToDelete.add(path);
      }
    }
    if (pathsToDelete.size > 0) {
      await Promise.allSettled(Array.from(pathsToDelete).map((p) => deleteFileByPath(p)));
    }

    const newData: AboutContentData = {
      text_content,
      image_urls: finalImageUrls,
      image_aspect_ratio,
    };

    await db
      .insert(appSettings)
      .values({ key: APP_SETTINGS_ABOUT_KEY, value: JSON.stringify(newData) })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value: sql`EXCLUDED.value` },
      });

    return { success: true, error: null, data: newData };
  } catch (error) {
    console.error("[saveAboutContentAction]", error);
    await Promise.allSettled(uploadedImagePathsToRollback.map((p) => deleteFileByPath(p)));
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
