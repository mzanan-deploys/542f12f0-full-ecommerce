import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { productImages, productVariants, products, setProducts } from "@/db/schema";
import {
  deleteProductImage,
  uploadProductImage,
} from "@/lib/helpers/storageHelpers";
import { extractImageFilesFromFormData } from "@/lib/helpers/formHelpers";

export interface ImageUploadResult {
  publicUrl: string;
  path: string;
  tempId: string | null;
}

export interface ProductImageData {
  product_id: string;
  image_url: string;
  position: number;
  alt_text: string;
}

export async function processProductImages(
  imageFiles: Array<{ file: File; tempId: string | null }>,
): Promise<{ uploadedImageResults: ImageUploadResult[]; uploadedImagePaths: string[] }> {
  const uploadedImageResults: ImageUploadResult[] = [];
  const uploadedImagePaths: string[] = [];

  await Promise.all(
    imageFiles.map(async (fileInfo) => {
      const uploadResult = await uploadProductImage(fileInfo.file);
      if (uploadResult.error || !uploadResult.publicUrl || !uploadResult.path) {
        throw new Error(uploadResult.error || `Image upload failed: ${fileInfo.file.name}`);
      }
      uploadedImageResults.push({
        publicUrl: uploadResult.publicUrl,
        path: uploadResult.path,
        tempId: fileInfo.tempId,
      });
      uploadedImagePaths.push(uploadResult.path);
    }),
  );

  return { uploadedImageResults, uploadedImagePaths };
}

export function createImageInsertData(
  uploadedImageResults: ImageUploadResult[],
  finalImageOrderIds: string[],
  productId: string,
): ProductImageData[] {
  const useOrder =
    finalImageOrderIds.length === uploadedImageResults.length && finalImageOrderIds.length > 0;

  return uploadedImageResults
    .map((uploadInfo, index) => {
      let position = index;
      if (useOrder && uploadInfo.tempId) {
        const orderIndex = finalImageOrderIds.indexOf(uploadInfo.tempId);
        if (orderIndex !== -1) position = orderIndex;
      }
      return {
        product_id: productId,
        image_url: uploadInfo.publicUrl,
        position,
        alt_text: `Product image ${position + 1}`,
      };
    })
    .sort((a, b) => a.position - b.position);
}

export async function insertProductImages(imageInsertData: ProductImageData[]): Promise<void> {
  if (imageInsertData.length === 0) return;
  await db.insert(productImages).values(
    imageInsertData.map((img) => ({
      productId: img.product_id,
      imageUrl: img.image_url,
      position: img.position,
      altText: img.alt_text,
    })),
  );
}

export async function insertProductVariants(productId: string, sizeNames: string[]): Promise<void> {
  if (!sizeNames || sizeNames.length === 0) return;
  await db.insert(productVariants).values(sizeNames.map((sizeName) => ({ productId, sizeName })));
}

export async function insertProductSetAssociations(
  productId: string,
  setIds: string[],
): Promise<void> {
  if (!setIds || setIds.length === 0) return;
  await db.insert(setProducts).values(
    setIds.map((setId, index) => ({ productId, setId, position: index })),
  );
}

export async function cleanupFailedProductCreation(
  uploadedImagePaths: string[],
  createdProductId: string | null,
): Promise<void> {
  if (uploadedImagePaths.length > 0) {
    try {
      await Promise.allSettled(uploadedImagePaths.map((path) => deleteProductImage(path)));
    } catch (cleanupErr) {
      console.error("[cleanup] storage delete failed", cleanupErr);
    }
  }
  if (createdProductId) {
    try {
      await db.delete(products).where(eq(products.id, createdProductId));
    } catch (cleanupErr) {
      console.error("[cleanup] product delete failed", cleanupErr);
    }
  }
}

export function parseFormDataArrays(formData: FormData): {
  parsedSelectedSizeNames: string[];
  parsedSetIds: string[];
  error?: string;
} {
  const selectedSizeNamesString = formData.get("selected_size_names");
  const setIdsString = formData.get("setIds");

  let parsedSelectedSizeNames: string[] = [];
  if (typeof selectedSizeNamesString === "string") {
    try {
      parsedSelectedSizeNames = JSON.parse(selectedSizeNamesString);
      if (!Array.isArray(parsedSelectedSizeNames)) parsedSelectedSizeNames = [];
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : "parse error";
      return {
        parsedSelectedSizeNames: [],
        parsedSetIds: [],
        error: `Invalid format for selected sizes: ${message}`,
      };
    }
  }

  let parsedSetIds: string[] = [];
  if (typeof setIdsString === "string") {
    try {
      parsedSetIds = JSON.parse(setIdsString);
      if (!Array.isArray(parsedSetIds)) throw new Error("Parsed setIds is not an array.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "parse error";
      return {
        parsedSelectedSizeNames,
        parsedSetIds: [],
        error: `Invalid format for set IDs: ${message}`,
      };
    }
  }

  return { parsedSelectedSizeNames, parsedSetIds };
}

export function prepareImageFiles(formData: FormData): Array<{ file: File; tempId: string | null }> {
  const imageFiles = extractImageFilesFromFormData(formData);
  return imageFiles.map((file: File) => {
    const nameParts = file.name.split("___");
    const tempId: string | null =
      nameParts.length > 1 && nameParts[0].startsWith("temp-") ? nameParts[0] : null;
    return { file, tempId };
  });
}

export function parseImageOrder(imageOrderJson: string | null): string[] {
  if (typeof imageOrderJson !== "string") return [];
  try {
    const finalImageOrderIds = JSON.parse(imageOrderJson);
    return Array.isArray(finalImageOrderIds) ? finalImageOrderIds : [];
  } catch {
    return [];
  }
}

export async function updateProductVariants(productId: string, newSizeNames: string[]): Promise<void> {
  const existing = await db
    .select({ id: productVariants.id, sizeName: productVariants.sizeName })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  const existingNames = new Set(existing.map((v) => v.sizeName));
  const newNames = new Set(newSizeNames);

  const toDelete = existing.filter((v) => !newNames.has(v.sizeName));
  const toCreate = newSizeNames.filter((name) => !existingNames.has(name));

  if (toDelete.length > 0) {
    await db
      .delete(productVariants)
      .where(inArray(productVariants.id, toDelete.map((v) => v.id)));
  }
  if (toCreate.length > 0) {
    await insertProductVariants(productId, toCreate);
  }
}

export async function updateProductImages(
  productId: string,
  formData: FormData,
  imageOrderJson: string | null,
): Promise<string[]> {
  const uploadedImagePaths: string[] = [];
  const finalImageOrderIds = parseImageOrder(imageOrderJson);
  const imageFiles = prepareImageFiles(formData);
  const deleteImageIds = formData.getAll("deleteImageIds") as string[];

  try {
    const existing = await db
      .select({ id: productImages.id, imageUrl: productImages.imageUrl })
      .from(productImages)
      .where(eq(productImages.productId, productId));

    if (deleteImageIds.length > 0) {
      const imagesToDelete = existing.filter((img) => deleteImageIds.includes(img.id));
      await Promise.allSettled(imagesToDelete.map((img) => deleteProductImage(img.imageUrl)));
      await db.delete(productImages).where(inArray(productImages.id, deleteImageIds));
    }

    if (imageFiles.length > 0) {
      const { uploadedImageResults, uploadedImagePaths: newPaths } = await processProductImages(imageFiles);
      uploadedImagePaths.push(...newPaths);
      const imageInsertData = createImageInsertData(uploadedImageResults, finalImageOrderIds, productId);
      await insertProductImages(imageInsertData);
    }

    if (finalImageOrderIds.length > 0) {
      const current = await db
        .select({ id: productImages.id, position: productImages.position })
        .from(productImages)
        .where(eq(productImages.productId, productId));
      const map = new Map(current.map((img) => [img.id, img]));

      const updates: Array<{ id: string; position: number }> = [];
      finalImageOrderIds.forEach((id, index) => {
        if (!id.startsWith("temp-")) {
          const existingImg = map.get(id);
          if (existingImg && existingImg.position !== index) {
            updates.push({ id, position: index });
          }
        }
      });

      for (const u of updates) {
        await db.update(productImages).set({ position: u.position }).where(eq(productImages.id, u.id));
      }
    }

    return uploadedImagePaths;
  } catch (error) {
    if (uploadedImagePaths.length > 0) {
      await Promise.allSettled(uploadedImagePaths.map((path) => deleteProductImage(path)));
    }
    throw error;
  }
}

export async function updateProductSetAssociations(
  productId: string,
  newSetIds: string[],
): Promise<void> {
  await db.delete(setProducts).where(eq(setProducts.productId, productId));
  if (newSetIds.length > 0) {
    await insertProductSetAssociations(productId, newSetIds);
  }
}
