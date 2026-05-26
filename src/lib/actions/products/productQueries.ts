"use server";

import { and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";

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
  productCategorySelector,
  productImageSelector,
  productSelector,
  productVariantSelector,
  sizeGuideTemplateSelector,
} from "@/lib/db/selectors";
import type { ActionResponse } from "@/types/actions";
import type {
  ProductByIdEditResponse,
  ProductListResponse,
  ProductPageData,
} from "@/types/product";

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
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderColumn =
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
      .where(whereClause);
    const count = countRows[0]?.count ?? 0;

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        is_active: products.isActive,
        created_at: products.createdAt,
        stock_quantity: products.stockQuantity,
        category_name: productCategories.name,
      })
      .from(products)
      .leftJoin(productCategories, eq(productCategories.id, products.categoryId))
      .where(whereClause)
      .orderBy(orderAsc ? asc(orderColumn) : desc(orderColumn))
      .limit(limit)
      .offset(offset);

    const productIds = rows.map((r) => r.id);
    const allImages = productIds.length
      ? await db
          .select({
            productId: productImages.productId,
            imageUrl: productImages.imageUrl,
            position: productImages.position,
          })
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
          .orderBy(asc(productImages.position))
      : [];

    const firstImageByProduct: Record<string, string | null> = {};
    for (const img of allImages) {
      if (!(img.productId in firstImageByProduct)) {
        firstImageByProduct[img.productId] = img.imageUrl;
      }
    }

    const productsOut = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      price: r.price,
      is_active: r.is_active,
      created_at: r.created_at,
      stock_quantity: r.stock_quantity,
      product_images: firstImageByProduct[r.id]
        ? [{ image_url: firstImageByProduct[r.id], position: 0 }]
        : [],
      product_categories: r.category_name ? { name: r.category_name } : null,
    }));

    return {
      success: true,
      data: { products: productsOut as unknown as ProductListResponse["data"] extends { products: infer P } ? P : never, totalPages: null, count },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: `Server error: ${message}` };
  }
};

export async function getProductBySlugAction(params: {
  slug: string;
}): Promise<ActionResponse<ProductPageData>> {
  const { slug } = params;
  if (!slug) return { success: false, error: "Product slug is required" };

  try {
    const [base] = await db
      .select(productSelector)
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.isActive, true)))
      .limit(1);
    if (!base) return { success: false, error: "Product not found" };

    const [images, variants, categoryRow] = await Promise.all([
      db
        .select(productImageSelector)
        .from(productImages)
        .where(eq(productImages.productId, base.id))
        .orderBy(asc(productImages.position)),
      db
        .select(productVariantSelector)
        .from(productVariants)
        .where(eq(productVariants.productId, base.id)),
      base.category_id
        ? db
            .select({
              ...productCategorySelector,
              size_guide: sizeGuideTemplateSelector,
            })
            .from(productCategories)
            .leftJoin(sizeGuideTemplates, eq(sizeGuideTemplates.id, productCategories.sizeGuideId))
            .where(eq(productCategories.id, base.category_id))
            .limit(1)
        : Promise.resolve([]),
    ]);

    const category = categoryRow[0] ?? null;

    const data = {
      ...base,
      product_images: images,
      product_variants: variants,
      product_categories: category
        ? {
            id: category.id,
            name: category.name,
            size_guide_id: category.size_guide_id,
            size_guide_templates: category.size_guide ?? null,
          }
        : null,
    };

    return { success: true, data: data as unknown as ProductPageData };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: `Server error: ${message}` };
  }
}

export const getProductByIdForEdit = async (
  productId: string,
): Promise<ProductByIdEditResponse> => {
  if (!productId) return { success: false, error: "Product ID is required" };

  try {
    const [base] = await db
      .select(productSelector)
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!base) return { success: false, error: "Product not found" };

    const [images, variants, setLinks] = await Promise.all([
      db
        .select(productImageSelector)
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.position)),
      db
        .select(productVariantSelector)
        .from(productVariants)
        .where(eq(productVariants.productId, productId)),
      db
        .select({
          set_id: setProducts.setId,
          sets: { id: sets.id, name: sets.name },
        })
        .from(setProducts)
        .leftJoin(sets, eq(sets.id, setProducts.setId))
        .where(eq(setProducts.productId, productId)),
    ]);

    const data = {
      ...base,
      product_images: images,
      product_variants: variants,
      set_products: setLinks,
    };

    return { success: true, data: data as unknown as ProductByIdEditResponse["data"] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: `Server error: ${message}` };
  }
};
