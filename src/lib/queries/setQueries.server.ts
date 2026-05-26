"use server";

import { and, asc, desc, eq, ilike, inArray, notInArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  productCategories,
  productImages,
  productVariants,
  products,
  setImages,
  setProducts,
  sets,
  sizeGuideTemplates,
} from "@/db/schema";
import {
  productImageSelector,
  productSelector,
  setImageSelector,
  setProductSelector,
  setSelector,
} from "@/lib/db/selectors";
import type { SetType, SetLayoutType } from "@/lib/schemas/setSchema";
import type { ActionResponse } from "@/types/actions";
import type { ProductWithPosition, SetRow } from "@/types/db";
import type {
  AdminSetListItem,
  AdminSetsListResult,
  AvailableProductsResult,
  ProductWithThumbnail,
  PublicSetListItem,
  SetPageData,
  SetPageProduct,
  SetPageResult,
} from "@/types/sets";
import type {
  AdminSetsListParams,
  AvailableProductsParams,
  PublicSetsListResult,
} from "@/types/setActions";
import type { SelectOption } from "@/types/ui";

export async function getPublicSetsList(limit?: number): Promise<PublicSetsListResult> {
  try {
    const rows = await db
      .select({
        ...setSelector,
        product_id: setProducts.productId,
        image_url: setImages.imageUrl,
        image_position: setImages.position,
      })
      .from(sets)
      .innerJoin(setProducts, eq(setProducts.setId, sets.id))
      .leftJoin(setImages, eq(setImages.setId, sets.id))
      .where(eq(sets.isActive, true))
      .orderBy(desc(sets.createdAt), asc(setImages.position));

    const grouped = new Map<string, PublicSetListItem>();
    for (const row of rows) {
      const existing = grouped.get(row.id) ?? {
        id: row.id,
        name: row.name,
        slug: row.slug,
        type: row.type as SetType | null,
        description: row.description,
        layout_type: row.layout_type as SetLayoutType | null,
        image_urls: [] as string[],
      };
      if (row.image_url && !existing.image_urls!.includes(row.image_url)) {
        existing.image_urls!.push(row.image_url);
      }
      grouped.set(row.id, existing);
    }

    let result = Array.from(grouped.values());
    if (typeof limit === "number" && limit > 0) {
      result = result.slice(0, limit);
    }

    return { success: true, data: { sets: result } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: `Server error: ${message}` };
  }
}

export async function getAdminSetsList(
  params: AdminSetsListParams = {},
): Promise<AdminSetsListResult> {
  const { orderBy = "created_at", orderAsc = false, filters = {} } = params;

  try {
    const conditions = [];
    if (filters.name) conditions.push(ilike(sets.name, `%${filters.name}%`));
    if (filters.type) conditions.push(eq(sets.type, filters.type));
    if (filters.is_active !== undefined && filters.is_active !== null) {
      conditions.push(eq(sets.isActive, filters.is_active));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countRows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sets)
      .where(whereClause);
    const count = countRows[0]?.count ?? 0;

    const orderColumn =
      orderBy === "name"
        ? sets.name
        : orderBy === "is_active"
          ? sets.isActive
          : orderBy === "type"
            ? sets.type
            : sets.createdAt;

    let query = db
      .select({
        id: sets.id,
        name: sets.name,
        slug: sets.slug,
        is_active: sets.isActive,
        type: sets.type,
        created_at: sets.createdAt,
      })
      .from(sets)
      .where(whereClause)
      .orderBy(orderAsc ? asc(orderColumn) : desc(orderColumn))
      .$dynamic();

    if (params.limit && params.offset !== undefined) {
      query = query.limit(params.limit).offset(params.offset);
    }

    const setsData = await query;

    let productCounts: Record<string, number> = {};
    let firstImages: Record<string, string | null> = {};
    if (setsData.length > 0) {
      const setIds = setsData.map((s) => s.id);
      const counts = await db
        .select({ setId: setProducts.setId, productId: setProducts.productId })
        .from(setProducts)
        .where(inArray(setProducts.setId, setIds));
      productCounts = counts.reduce<Record<string, number>>((acc, item) => {
        acc[item.setId] = (acc[item.setId] || 0) + 1;
        return acc;
      }, {});

      const images = await db
        .select({
          setId: setImages.setId,
          imageUrl: setImages.imageUrl,
          position: setImages.position,
        })
        .from(setImages)
        .where(inArray(setImages.setId, setIds))
        .orderBy(asc(setImages.position));

      for (const img of images) {
        if (!(img.setId in firstImages)) {
          firstImages[img.setId] = img.imageUrl;
        }
      }
    }

    const result: AdminSetListItem[] = setsData.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      is_active: s.is_active,
      product_count: productCounts[s.id] || 0,
      type: s.type as SetType | null,
      created_at: s.created_at ?? new Date(),
      image_url: firstImages[s.id] ?? null,
    }));

    return { success: true, data: { sets: result, count } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getAdminSetById(
  id: string,
): Promise<ActionResponse<SetRow & { set_images: Array<Record<string, unknown>> }>> {
  if (!id) return { success: false, error: "Set ID is required" };

  try {
    const [setRow] = await db
      .select(setSelector)
      .from(sets)
      .where(eq(sets.id, id))
      .limit(1);
    if (!setRow) return { success: false, error: "Set not found" };

    const images = await db
      .select(setImageSelector)
      .from(setImages)
      .where(eq(setImages.setId, id))
      .orderBy(asc(setImages.position));

    return {
      success: true,
      data: { ...(setRow as SetRow), set_images: images },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getSetPageBySlug(slug: string): Promise<SetPageResult> {
  if (!slug) return { success: false, error: "Slug is required" };

  try {
    const [setRow] = await db
      .select(setSelector)
      .from(sets)
      .where(and(eq(sets.slug, slug), eq(sets.isActive, true)))
      .limit(1);

    if (!setRow) return { success: false, error: "Set not found" };

    const setImagesRows = await db
      .select(setImageSelector)
      .from(setImages)
      .where(eq(setImages.setId, setRow.id))
      .orderBy(asc(setImages.position));

    const productRows = await db
      .select({
        ...productSelector,
        sp_position: setProducts.position,
        category: {
          id: productCategories.id,
          name: productCategories.name,
          size_guide_id: productCategories.sizeGuideId,
        },
        size_guide_data: sizeGuideTemplates.guideData,
      })
      .from(setProducts)
      .innerJoin(products, eq(products.id, setProducts.productId))
      .leftJoin(productCategories, eq(productCategories.id, products.categoryId))
      .leftJoin(sizeGuideTemplates, eq(sizeGuideTemplates.id, productCategories.sizeGuideId))
      .where(eq(setProducts.setId, setRow.id))
      .orderBy(asc(setProducts.position));

    const productIds = productRows.map((p) => p.id);
    const allImages = productIds.length
      ? await db
          .select(productImageSelector)
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
          .orderBy(asc(productImages.position))
      : [];
    const allVariants = productIds.length
      ? await db
          .select({
            id: productVariants.id,
            product_id: productVariants.productId,
            size_name: productVariants.sizeName,
          })
          .from(productVariants)
          .where(inArray(productVariants.productId, productIds))
      : [];

    const processedProducts: SetPageProduct[] = productRows.map((p) => {
      const imgs = allImages.filter((img) => img.product_id === p.id);
      const variants = allVariants.filter((v) => v.product_id === p.id);
      const uniqueSizes = Array.from(new Set(variants.map((v) => v.size_name).filter(Boolean)));
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        description: p.description,
        stock_quantity: p.stock_quantity,
        is_active: p.is_active,
        created_at: p.created_at,
        updated_at: p.updated_at,
        category_id: p.category_id,
        product_images: imgs,
        product_variants: variants,
        size_guide_data: p.size_guide_data,
      } as SetPageProduct;
    });

    const result: SetPageData = {
      ...(setRow as SetRow),
      type: setRow.type as SetType | null,
      layout_type: setRow.layout_type as SetLayoutType | null,
      set_images: setImagesRows,
      products: processedProducts,
    };

    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: `Server error: ${message}` };
  }
}

export async function getSetsForSelection(): Promise<ActionResponse<{ sets: SelectOption[] }>> {
  try {
    const rows = await db
      .select({ id: sets.id, name: sets.name })
      .from(sets)
      .where(eq(sets.isActive, true))
      .orderBy(asc(sets.name));
    return {
      success: true,
      data: { sets: rows.map((s) => ({ value: s.id, label: s.name })) },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: `Server error: ${message}` };
  }
}

export async function getAvailableProductsForSetAction(
  setId: string,
  params: AvailableProductsParams = {},
): Promise<AvailableProductsResult> {
  const { limit = 8, offset = 0, search = "" } = params;

  try {
    const existing = await db
      .select({ productId: setProducts.productId })
      .from(setProducts)
      .where(eq(setProducts.setId, setId));
    const existingIds = existing.map((e) => e.productId);

    const conditions = [eq(products.isActive, true)];
    if (existingIds.length > 0) {
      conditions.push(notInArray(products.id, existingIds));
    }
    if (search.trim()) {
      conditions.push(ilike(products.name, `%${search.trim()}%`));
    }
    const where = and(...conditions);

    const countRows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(where);
    const count = countRows[0]?.count ?? 0;

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        image_url: productImages.imageUrl,
      })
      .from(products)
      .leftJoin(productImages, eq(productImages.productId, products.id))
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    const grouped = new Map<string, ProductWithThumbnail>();
    for (const r of rows) {
      if (!grouped.has(r.id)) {
        grouped.set(r.id, {
          id: r.id,
          name: r.name,
          slug: r.slug,
          thumbnail_url: r.image_url,
        });
      }
    }

    return {
      success: true,
      data: { products: Array.from(grouped.values()), count },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

export async function getProductsInSetAction(
  setId: string,
): Promise<ActionResponse<{ products: ProductWithPosition[] }>> {
  try {
    const rows = await db
      .select({
        ...productSelector,
        sp_position: setProducts.position,
      })
      .from(setProducts)
      .innerJoin(products, eq(products.id, setProducts.productId))
      .where(eq(setProducts.setId, setId))
      .orderBy(asc(setProducts.position));

    const productIds = rows.map((r) => r.id);
    const images = productIds.length
      ? await db
          .select(productImageSelector)
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
          .orderBy(asc(productImages.position))
      : [];

    const result: ProductWithPosition[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      price: r.price,
      is_featured: r.is_featured,
      is_active: r.is_active,
      category_id: r.category_id,
      stock_quantity: r.stock_quantity,
      created_at: r.created_at,
      updated_at: r.updated_at,
      position: r.sp_position,
      product_images: images.filter((img) => img.product_id === r.id),
    }));

    return { success: true, data: { products: result } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getSetsByIdsAction(setIds: string[]): Promise<ActionResponse<SetRow[]>> {
  if (!setIds || setIds.length === 0) {
    return { success: true, data: [] };
  }
  try {
    const data = await db
      .select(setSelector)
      .from(sets)
      .where(inArray(sets.id, setIds));
    return { success: true, data: data as SetRow[] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
