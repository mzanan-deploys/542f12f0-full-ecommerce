"use server";

import { and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { revalidatePath, revalidateTag } from "next/cache";

import { db } from "@/db";
import {
  productCategories,
  productImages,
  productVariants,
  products,
  setProducts,
  sets,
  sizeGuideTemplates,
} from "@/db/schema";
import {
  productImageSelector,
  productSelector,
  productVariantSelector,
} from "@/lib/db/selectors";
import { requireAdmin } from "@/lib/auth/authz";
import { extractImageFilesFromFormData } from "@/lib/helpers/formHelpers";
import {
  cleanupFailedProductCreation,
  parseFormDataArrays,
  prepareImageFiles,
  updateProductImages,
  updateProductSetAssociations,
  updateProductVariants,
} from "@/lib/helpers/productHelpers";
import { uploadProductImage } from "@/lib/helpers/storageHelpers";
import { createProductSchema, updateProductSchema } from "@/lib/schemas/productSchema";
import type { ActionResponse } from "@/types/actions";
import type {
  ProductByIdEditResponse,
  ProductForEdit,
  ProductListResponse,
  ProductPageData,
  ProductWithIncludes,
} from "@/types/product";

export async function createProduct(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const imageFiles = extractImageFilesFromFormData(formData);
  const imageOrderJson = formData.get("imageOrder");
  const setIdsString = formData.get("setIds");
  const categoryId = formData.get("category_id") as string | null;
  const stockQuantity = formData.get("stock_quantity");
  const selectedSizeNamesString = formData.get("selected_size_names");

  let parsedSelectedSizeNames: string[] = [];
  if (typeof selectedSizeNamesString === "string") {
    try {
      parsedSelectedSizeNames = JSON.parse(selectedSizeNamesString);
      if (!Array.isArray(parsedSelectedSizeNames)) parsedSelectedSizeNames = [];
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : "parse error";
      return { success: false, error: `Invalid format for selected sizes: ${message}` };
    }
  }

  let parsedSetIds: string[] = [];
  if (typeof setIdsString === "string") {
    try {
      parsedSetIds = JSON.parse(setIdsString);
      if (!Array.isArray(parsedSetIds)) throw new Error("Parsed setIds is not an array.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "parse error";
      return { success: false, error: `Invalid format for set IDs: ${message}` };
    }
  }

  const rawData = {
    name: formData.get("name") as string | null,
    slug: formData.get("slug") as string | null,
    description: formData.get("description") || null,
    price: formData.get("price"),
    is_active: formData.get("is_active") === "true",
    images: imageFiles,
    setIds: parsedSetIds,
    category_id: categoryId,
    stock_quantity: stockQuantity,
    selected_size_names: parsedSelectedSizeNames,
  };

  const validation = createProductSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: `Validation failed: ${JSON.stringify(validation.error.flatten().fieldErrors)}`,
    };
  }

  const {
    images: imageFilesRaw,
    setIds: validatedSetIds,
    category_id: validatedCategoryId,
    stock_quantity: validatedStockQuantity,
    selected_size_names: validatedSizeNames,
    ...validatedData
  } = validation.data;

  let finalImageOrderIds: string[] = [];
  if (typeof imageOrderJson === "string") {
    try {
      finalImageOrderIds = JSON.parse(imageOrderJson);
      if (!Array.isArray(finalImageOrderIds)) finalImageOrderIds = [];
    } catch {
      finalImageOrderIds = [];
    }
  }

  const filesWithTempIds: Array<{ file: File; tempId: string | null }> = imageFilesRaw.map(
    (file) => {
      const nameParts = file.name.split("___");
      const tempId =
        nameParts.length > 1 && nameParts[0].startsWith("temp-") ? nameParts[0] : null;
      return { file, tempId };
    },
  );
  const useOrder =
    finalImageOrderIds.length === filesWithTempIds.length && finalImageOrderIds.length > 0;

  const uploadedImageResults: Array<{ publicUrl: string; path: string; tempId: string | null }> =
    [];
  const uploadedImagePaths: string[] = [];
  let createdProductId: string | null = null;

  try {
    const [created] = await db
      .insert(products)
      .values({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        price: String(validatedData.price),
        isActive: validatedData.is_active,
        categoryId: validatedCategoryId,
        stockQuantity: validatedStockQuantity,
      })
      .returning({ id: products.id });

    if (!created) throw new Error("Product not created");
    createdProductId = created.id;

    if (validatedSizeNames && validatedSizeNames.length > 0) {
      await db.insert(productVariants).values(
        validatedSizeNames.map((sizeName) => ({
          productId: createdProductId!,
          sizeName,
        })),
      );
    }

    await Promise.all(
      filesWithTempIds.map(async (fileInfo) => {
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

    const imageInsertData = uploadedImageResults
      .map((uploadInfo, index) => {
        let position = index;
        if (useOrder && uploadInfo.tempId) {
          const orderIndex = finalImageOrderIds.indexOf(uploadInfo.tempId);
          if (orderIndex !== -1) position = orderIndex;
        }
        return {
          productId: createdProductId!,
          imageUrl: uploadInfo.publicUrl,
          position,
          altText: `Product image ${position + 1}`,
        };
      })
      .sort((a, b) => a.position - b.position);

    if (imageInsertData.length > 0) {
      await db.insert(productImages).values(imageInsertData);
    }

    if (validatedSetIds && Array.isArray(validatedSetIds) && validatedSetIds.length > 0) {
      await db.insert(setProducts).values(
        validatedSetIds.map((setId: string, index: number) => ({
          productId: createdProductId!,
          setId,
          position: index,
        })),
      );
    }

    revalidateTag("products", "default");
    revalidateTag(`product-${validatedData.slug}`, "default");
    revalidatePath("/admin/products");
    revalidatePath(`/product/${validatedData.slug}`);
    revalidatePath("/");
    return { success: true, message: "Product created successfully" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await cleanupFailedProductCreation(uploadedImagePaths, createdProductId);
    if (message.includes("duplicate") && message.includes("slug")) {
      return {
        success: false,
        error: `Database error: Slug '${validatedData.slug}' already exists.`,
      };
    }
    return { success: false, error: `Error creating product: ${message}` };
  }
}

export async function updateProduct(
  productId: string,
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const { parsedSelectedSizeNames, parsedSetIds, error: parseError } = parseFormDataArrays(formData);
  if (parseError) return { success: false, error: parseError };

  const imageFiles = prepareImageFiles(formData);
  const categoryId = formData.get("category_id") as string | null;
  const stockQuantity = formData.get("stock_quantity");

  const rawData = {
    name: formData.get("name") as string | null,
    slug: formData.get("slug") as string | null,
    description: formData.get("description") || null,
    price: formData.get("price"),
    is_active: formData.get("is_active") === "true",
    images: imageFiles.map((f) => f.file),
    setIds: parsedSetIds,
    category_id: categoryId,
    stock_quantity: stockQuantity,
    selected_size_names: parsedSelectedSizeNames,
  };

  const validation = updateProductSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: `Validation failed: ${JSON.stringify(validation.error.flatten().fieldErrors)}`,
    };
  }

  const {
    setIds: validatedSetIds,
    category_id: validatedCategoryId,
    stock_quantity: validatedStockQuantity,
    selected_size_names: validatedSizeNames,
    images: _images,
    ...validatedData
  } = validation.data;

  const uploadedImagePaths: string[] = [];
  try {
    await db
      .update(products)
      .set({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        price: String(validatedData.price),
        isActive: validatedData.is_active,
        categoryId: validatedCategoryId,
        stockQuantity: validatedStockQuantity,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    if (validatedSizeNames && validatedSizeNames.length > 0) {
      await updateProductVariants(productId, validatedSizeNames);
    }

    const imageOrderJson = formData.get("imageOrder") as string | null;
    const newImagePaths = await updateProductImages(productId, formData, imageOrderJson);
    uploadedImagePaths.push(...newImagePaths);

    if (validatedSetIds && validatedSetIds.length > 0) {
      await updateProductSetAssociations(productId, validatedSetIds);
    }

    revalidateTag("products", "default");
    revalidateTag(`product-${validatedData.slug}`, "default");
    revalidatePath("/admin/products");
    revalidatePath(`/product/${validatedData.slug}`);
    revalidatePath("/");
    return { success: true, message: "Product updated successfully" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await cleanupFailedProductCreation(uploadedImagePaths, null);
    if (message.includes("duplicate") && message.includes("slug")) {
      return {
        success: false,
        error: `Database error: Slug '${validatedData.slug}' already exists.`,
      };
    }
    return { success: false, error: `Error updating product: ${message}` };
  }
}

export async function deleteProduct(productId: string): Promise<ActionResponse> {
  if (!productId) return { success: false, error: "Product ID is required" };
  try {
    await requireAdmin();

    const [product] = await db
      .select({ slug: products.slug })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!product) return { success: false, error: "Product not found" };

    await db.delete(productImages).where(eq(productImages.productId, productId));
    await db.delete(productVariants).where(eq(productVariants.productId, productId));
    await db.delete(setProducts).where(eq(setProducts.productId, productId));
    await db.delete(products).where(eq(products.id, productId));

    revalidateTag("products", "default");
    if (product.slug) {
      revalidateTag(`product-${product.slug}`, "default");
      revalidatePath(`/product/${product.slug}`);
    }
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Error deleting product: ${message}` };
  }
}

export const getProductsListAction = async (params: {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderAsc?: boolean;
  filters?: Record<string, unknown>;
}): Promise<ProductListResponse> => {
  const { limit = 10, offset = 0, orderBy = "created_at", orderAsc = false, filters = {} } = params;

  try {
    const conditions = [];
    if (typeof filters.name === "string" && filters.name) {
      conditions.push(ilike(products.name, `%${filters.name}%`));
    }
    if (filters.is_active !== undefined && filters.is_active !== null) {
      conditions.push(eq(products.isActive, Boolean(filters.is_active)));
    }
    if (filters.category_id && typeof filters.category_id === "string") {
      conditions.push(eq(products.categoryId, filters.category_id));
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const orderColumn: PgColumn =
      orderBy === "name"
        ? products.name
        : orderBy === "price"
          ? products.price
          : orderBy === "is_active"
            ? products.isActive
            : products.createdAt;

    const countRows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(where);
    const count = countRows[0]?.count ?? 0;

    const baseRows = await db
      .select(productSelector)
      .from(products)
      .where(where)
      .orderBy(orderAsc ? asc(orderColumn) : desc(orderColumn))
      .limit(limit)
      .offset(offset);

    const productIds = baseRows.map((r) => r.id);

    const [allImages, allVariants, allSetLinks] = await Promise.all([
      productIds.length
        ? db
            .select(productImageSelector)
            .from(productImages)
            .where(inArray(productImages.productId, productIds))
            .orderBy(asc(productImages.position))
        : Promise.resolve([] as Array<{ product_id: string }>),
      productIds.length
        ? db
            .select({
              id: productVariants.id,
              product_id: productVariants.productId,
              size_name: productVariants.sizeName,
            })
            .from(productVariants)
            .where(inArray(productVariants.productId, productIds))
        : Promise.resolve([]),
      productIds.length
        ? db
            .select({
              product_id: setProducts.productId,
              set_id: sets.id,
              set_name: sets.name,
            })
            .from(setProducts)
            .leftJoin(sets, eq(sets.id, setProducts.setId))
            .where(inArray(setProducts.productId, productIds))
        : Promise.resolve([]),
    ]);

    const productsOut = baseRows.map((row): ProductWithIncludes => {
      const imgs = allImages.filter((img: { product_id: string }) => img.product_id === row.id);
      const variants = allVariants.filter((v) => v.product_id === row.id);
      const links = allSetLinks
        .filter((l) => l.product_id === row.id && l.set_id && l.set_name)
        .map((l) => ({ id: l.set_id!, name: l.set_name!, slug: "" }));

      return {
        ...row,
        product_images: imgs,
        product_variants: variants.map((v) => ({
          id: v.id,
          product_id: v.product_id,
          size_name: v.size_name,
        })),
        sets: links,
      } as unknown as ProductWithIncludes;
    });

    const totalPages = Math.ceil(count / limit);
    return {
      success: true,
      data: { products: productsOut, totalPages, count },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
};

export async function getProductBySlugAction(params: {
  slug: string;
}): Promise<ActionResponse<ProductPageData>> {
  try {
    const [base] = await db
      .select(productSelector)
      .from(products)
      .where(and(eq(products.slug, params.slug), eq(products.isActive, true)))
      .limit(1);
    if (!base) return { success: false, error: "Product not found" };

    const [images, variants, setLinks] = await Promise.all([
      db
        .select(productImageSelector)
        .from(productImages)
        .where(eq(productImages.productId, base.id))
        .orderBy(asc(productImages.position)),
      db
        .select(productVariantSelector)
        .from(productVariants)
        .where(eq(productVariants.productId, base.id)),
      db
        .select({ set_id: setProducts.setId })
        .from(setProducts)
        .where(eq(setProducts.productId, base.id)),
    ]);

    const productPageData: ProductPageData = {
      ...(base as ProductPageData),
      product_images: images,
      product_variants: variants.map((v) => ({
        id: v.id,
        size_name: v.size_name,
      })),
      set_products: setLinks,
    };

    return { success: true, data: productPageData };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export const getProductByIdForEdit = async (
  productId: string,
): Promise<ProductByIdEditResponse> => {
  try {
    const [base] = await db
      .select(productSelector)
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!base) return { success: false, error: "Product not found." };

    const [images, variants, setLinks, categoryRow] = await Promise.all([
      db
        .select(productImageSelector)
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.position)),
      db
        .select({ id: productVariants.id, size_name: productVariants.sizeName })
        .from(productVariants)
        .where(eq(productVariants.productId, productId)),
      db
        .select({ set_id: setProducts.setId })
        .from(setProducts)
        .where(eq(setProducts.productId, productId)),
      base.category_id
        ? db
            .select({
              id: productCategories.id,
              name: productCategories.name,
              size_guide_id: productCategories.sizeGuideId,
              size_guide_template_id: sizeGuideTemplates.id,
              size_guide_template_name: sizeGuideTemplates.name,
            })
            .from(productCategories)
            .leftJoin(
              sizeGuideTemplates,
              eq(sizeGuideTemplates.id, productCategories.sizeGuideId),
            )
            .where(eq(productCategories.id, base.category_id))
            .limit(1)
        : Promise.resolve([] as Array<Record<string, unknown>>),
    ]);

    const category = (categoryRow as Array<Record<string, unknown>>)[0];

    const productForEdit: ProductForEdit = {
      id: base.id,
      name: base.name,
      slug: base.slug,
      description: base.description,
      price: base.price,
      is_active: base.is_active,
      is_featured: base.is_featured,
      created_at: base.created_at,
      updated_at: base.updated_at,
      images,
      currentSetIds: setLinks.map((sp) => sp.set_id),
      category_id: base.category_id,
      category: category
        ? {
            id: category.id as string,
            name: category.name as string,
            size_guide_id: category.size_guide_id as string | null,
            size_guide_template: category.size_guide_template_id
              ? {
                  id: category.size_guide_template_id as string,
                  name: category.size_guide_template_name as string,
                }
              : null,
          }
        : null,
      stock_quantity: base.stock_quantity,
      selected_size_names: variants.map((pv) => pv.size_name),
    } as unknown as ProductForEdit;

    return { success: true, data: productForEdit };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { success: false, error: `Unexpected server error: ${message}` };
  }
};
