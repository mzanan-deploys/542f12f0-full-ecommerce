import { del, put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

import { optimizeImageFile, optimizeVideoFile } from "@/lib/helpers/mediaOptimization";

type UploadResult = { publicUrl: string | null; path: string | null; error: string | null };
type DeleteResult = { success: boolean; error: string | null };

async function uploadOptimizedImage(
  file: File,
  options: { maxWidth: number; maxHeight: number; quality: number; folder: string },
): Promise<UploadResult> {
  const optimized = await optimizeImageFile(file, {
    maxWidth: options.maxWidth,
    maxHeight: options.maxHeight,
    format: "webp",
    quality: options.quality,
  });

  const filePath = `${options.folder}/${uuidv4()}.${optimized.ext}`;

  try {
    const blob = await put(filePath, new Blob([new Uint8Array(optimized.buffer)], { type: optimized.mimeType }), {
      access: "public",
      contentType: optimized.mimeType,
      addRandomSuffix: false,
    });
    return { publicUrl: blob.url, path: blob.pathname, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown storage error";
    console.error(`[storage] upload failed (${options.folder})`, message);
    return { publicUrl: null, path: null, error: `Storage upload failed: ${message}` };
  }
}

async function deleteByUrlOrPath(target: string): Promise<DeleteResult> {
  if (!target) {
    return { success: false, error: "Path or URL cannot be empty." };
  }
  try {
    await del(target);
    return { success: true, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during file deletion";
    console.error("[storage] delete failed", target, message);
    return { success: false, error: `Failed to delete file from storage: ${message}` };
  }
}

export function uploadProductImage(file: File): Promise<UploadResult> {
  return uploadOptimizedImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 75, folder: "products" });
}

export function deleteProductImage(imageUrl: string): Promise<DeleteResult> {
  return deleteByUrlOrPath(imageUrl);
}

export function uploadCollectionImage(file: File): Promise<UploadResult> {
  return uploadOptimizedImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 75, folder: "sets" });
}

export function deleteCollectionImage(imagePath: string): Promise<DeleteResult> {
  return deleteByUrlOrPath(imagePath);
}

export function uploadAboutImage(file: File): Promise<UploadResult> {
  return uploadOptimizedImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 70, folder: "about" });
}

export function deleteFileByPath(filePath: string): Promise<DeleteResult> {
  return deleteByUrlOrPath(filePath);
}

export function getStoragePathFromUrl(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    return url.pathname.replace(/^\//, "");
  } catch (error) {
    console.error(`[storage] invalid URL: ${publicUrl}`, error);
    return null;
  }
}

export async function uploadHeroImage(file: File): Promise<UploadResult> {
  const isVideo = typeof file.type === "string" && file.type.startsWith("video/");

  let optimized: { buffer: Buffer; mimeType: string; ext: string };
  try {
    if (isVideo) {
      optimized = await optimizeVideoFile(file);
    } else {
      optimized = await optimizeImageFile(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        format: "webp",
        quality: 75,
      });
    }
  } catch (optError) {
    return {
      publicUrl: null,
      path: null,
      error: `Optimization failed: ${optError instanceof Error ? optError.message : "Unknown error"}`,
    };
  }

  const filePath = `hero/${uuidv4()}.${optimized.ext}`;

  try {
    const blob = await put(filePath, new Blob([new Uint8Array(optimized.buffer)], { type: optimized.mimeType }), {
      access: "public",
      contentType: optimized.mimeType,
      addRandomSuffix: false,
    });
    return { publicUrl: blob.url, path: blob.pathname, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown storage error";
    return { publicUrl: null, path: null, error: `Storage upload failed: ${message}` };
  }
}

export function deleteHeroImage(imagePath: string): Promise<DeleteResult> {
  return deleteByUrlOrPath(imagePath);
}
