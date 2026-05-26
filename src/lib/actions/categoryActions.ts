"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { productCategories, products, sizeGuideTemplates } from "@/db/schema";
import { verifyAdmin } from "@/lib/auth/serverAuth";
import { categoryFormSchema, type CategoryFormData } from "@/lib/schemas/categorySchema";
import type { ActionResponse } from "@/types/actions";
import type { ProductCategoryRow } from "@/types/category";

type CategoryWithSizeGuide = ProductCategoryRow & {
  size_guide_templates: { name: string } | null;
};

async function fetchCategoryWithSizeGuide(id: string): Promise<CategoryWithSizeGuide | null> {
  const rows = await db
    .select({
      id: productCategories.id,
      name: productCategories.name,
      size_guide_id: productCategories.sizeGuideId,
      created_at: productCategories.createdAt,
      updated_at: productCategories.updatedAt,
      size_guide_name: sizeGuideTemplates.name,
    })
    .from(productCategories)
    .leftJoin(sizeGuideTemplates, eq(sizeGuideTemplates.id, productCategories.sizeGuideId))
    .where(eq(productCategories.id, id))
    .limit(1);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    size_guide_id: r.size_guide_id,
    created_at: r.created_at,
    updated_at: r.updated_at,
    size_guide_templates: r.size_guide_name ? { name: r.size_guide_name } : null,
  };
}

export async function createCategoryAction(
  formData: CategoryFormData,
): Promise<ActionResponse<ProductCategoryRow>> {
  const validation = categoryFormSchema.safeParse(formData);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      (errors[path] ??= []).push(issue.message);
    });
    return { success: false, error: "Validation failed", errors };
  }

  try {
    await verifyAdmin();
    const { name, size_guide_id } = validation.data;
    const [inserted] = await db
      .insert(productCategories)
      .values({ name, sizeGuideId: size_guide_id ?? null })
      .returning({ id: productCategories.id });
    if (!inserted) return { success: false, error: "Failed to create category" };

    const created = await fetchCategoryWithSizeGuide(inserted.id);
    revalidatePath("/admin/categories");
    return { success: true, data: created as ProductCategoryRow };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return { success: false, error: message };
  }
}

export async function fetchCategoriesAction(): Promise<{
  data: ProductCategoryRow[] | null;
  error: string | null;
}> {
  try {
    const rows = await db
      .select({
        id: productCategories.id,
        name: productCategories.name,
        size_guide_id: productCategories.sizeGuideId,
        created_at: productCategories.createdAt,
        updated_at: productCategories.updatedAt,
        size_guide_name: sizeGuideTemplates.name,
      })
      .from(productCategories)
      .leftJoin(sizeGuideTemplates, eq(sizeGuideTemplates.id, productCategories.sizeGuideId))
      .orderBy(asc(productCategories.name));

    return {
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        size_guide_id: r.size_guide_id,
        created_at: r.created_at,
        updated_at: r.updated_at,
        size_guide_templates: r.size_guide_name ? { name: r.size_guide_name } : null,
      })) as ProductCategoryRow[],
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  formData: CategoryFormData,
): Promise<ActionResponse<ProductCategoryRow>> {
  const validation = categoryFormSchema.safeParse(formData);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      (errors[path] ??= []).push(issue.message);
    });
    return { success: false, error: "Validation failed", errors };
  }

  try {
    await verifyAdmin();
    const { name, size_guide_id } = validation.data;
    await db
      .update(productCategories)
      .set({ name, sizeGuideId: size_guide_id ?? null, updatedAt: new Date() })
      .where(eq(productCategories.id, categoryId));

    const updated = await fetchCategoryWithSizeGuide(categoryId);
    if (!updated) return { success: false, error: "Category not found" };

    revalidatePath("/admin/categories");
    return { success: true, data: updated as ProductCategoryRow };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    return { success: false, error: message };
  }
}

export async function deleteCategoryAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  if (!(await verifyAdmin())) {
    return { success: false, error: "Admin authorization required." };
  }
  if (!id) return { success: false, error: "Category ID is required for deletion." };

  try {
    const linked = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, id))
      .limit(1);
    if (linked.length > 0) {
      return {
        success: false,
        error:
          "Cannot delete category: It is currently associated with one or more products. Please reassign or delete these products first.",
      };
    }

    await db.delete(productCategories).where(eq(productCategories.id, id));
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("foreign key") || message.includes("23503")) {
      return {
        success: false,
        error:
          "Cannot delete category: It is referenced by other data. Ensure no products are linked first.",
      };
    }
    return { success: false, error: message };
  }
}
