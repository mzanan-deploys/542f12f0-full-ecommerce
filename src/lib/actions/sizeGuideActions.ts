"use server";

import { asc, desc, eq, ilike, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { productCategories, sizeGuideTemplates } from "@/db/schema";
import { sizeGuideTemplateSelector } from "@/lib/db/selectors";
import { requireAdmin } from "@/lib/auth/authz";
import { sizeGuideTemplateStorageSchema } from "@/lib/schemas/sizeGuideTemplateSchema";
import type { ActionResponse } from "@/types/actions";
import type { FetchDataParams } from "@/types/adminDataTable";
import type { BasicSizeGuideTemplate, SizeGuideTemplate } from "@/types/sizeGuide";

export async function getSizeGuideTemplates(): Promise<SizeGuideTemplate[]> {
  try {
    const rows = await db
      .select(sizeGuideTemplateSelector)
      .from(sizeGuideTemplates)
      .orderBy(asc(sizeGuideTemplates.name));
    return rows as SizeGuideTemplate[];
  } catch (error) {
    console.error("[getSizeGuideTemplates]", error);
    return [];
  }
}

export async function createSizeGuideTemplate(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  let rawData: { name: string; guide_data: unknown };
  try {
    rawData = {
      name: formData.get("name") as string,
      guide_data: JSON.parse(formData.get("guide_data") as string),
    };
  } catch {
    return { success: false, message: "Invalid guide data format." };
  }

  const validation = sizeGuideTemplateStorageSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      error: JSON.stringify(validation.error.flatten().fieldErrors),
    };
  }

  try {
    await db
      .insert(sizeGuideTemplates)
      .values({ name: validation.data.name, guideData: validation.data.guide_data });
    revalidatePath("/admin/size-guides");
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    return { success: true, message: "Size guide template created successfully." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("unique") || message.includes("23505")) {
      return { success: false, message: "A template with this name already exists." };
    }
    return { success: false, message };
  }
}

export async function updateSizeGuideTemplate(
  id: string,
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  if (!id) return { success: false, message: "Template ID is missing." };
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  let rawData: { name: string; guide_data: unknown };
  try {
    rawData = {
      name: formData.get("name") as string,
      guide_data: JSON.parse(formData.get("guide_data") as string),
    };
  } catch {
    return { success: false, message: "Invalid guide data format." };
  }

  const validation = sizeGuideTemplateStorageSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      error: JSON.stringify(validation.error.flatten().fieldErrors),
    };
  }

  try {
    await db
      .update(sizeGuideTemplates)
      .set({
        name: validation.data.name,
        guideData: validation.data.guide_data,
        updatedAt: new Date(),
      })
      .where(eq(sizeGuideTemplates.id, id));
    revalidatePath("/admin/size-guides");
    revalidatePath(`/admin/size-guides/${id}/edit`);
    revalidatePath("/admin/products");
    return { success: true, message: "Size guide template updated successfully." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("unique") || message.includes("23505")) {
      return { success: false, message: "A template with this name already exists." };
    }
    return { success: false, message };
  }
}

export async function getSizeGuideTemplateById(
  id: string,
): Promise<ActionResponse<SizeGuideTemplate>> {
  if (!id) return { success: false, message: "Template ID is missing." };
  try {
    const [row] = await db
      .select(sizeGuideTemplateSelector)
      .from(sizeGuideTemplates)
      .where(eq(sizeGuideTemplates.id, id))
      .limit(1);
    if (!row) return { success: false, message: "Size guide template not found." };
    return { success: true, data: row as SizeGuideTemplate };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message };
  }
}

export async function deleteSizeGuideTemplate(id: string): Promise<ActionResponse> {
  if (!id) return { success: false, message: "Template ID is missing." };
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const categoriesUsing = await db
      .select({ id: productCategories.id, name: productCategories.name })
      .from(productCategories)
      .where(eq(productCategories.sizeGuideId, id));
    if (categoriesUsing.length > 0) {
      const names = categoriesUsing.map((c) => c.name).join(", ");
      return {
        success: false,
        message: `Cannot delete: still used by ${categoriesUsing.length} categor${categoriesUsing.length > 1 ? "ies" : "y"}: ${names}.`,
      };
    }
    await db.delete(sizeGuideTemplates).where(eq(sizeGuideTemplates.id, id));
    revalidatePath("/admin/size-guides");
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    return { success: true, message: "Size guide template deleted." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message };
  }
}

export async function getAdminSizeGuidesList(
  params: FetchDataParams,
): Promise<ActionResponse<{ templates: SizeGuideTemplate[]; count: number | null }>> {
  const { limit = 10, offset = 0, orderBy = "name", orderAsc = true, filters = {} } = params;

  try {
    const where = filters.name ? ilike(sizeGuideTemplates.name, `%${filters.name}%`) : undefined;

    const countRows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sizeGuideTemplates)
      .where(where);
    const count = countRows[0]?.count ?? 0;

    const column: PgColumn =
      orderBy === "created_at"
        ? sizeGuideTemplates.createdAt
        : orderBy === "updated_at"
          ? sizeGuideTemplates.updatedAt
          : sizeGuideTemplates.name;

    const rows = await db
      .select(sizeGuideTemplateSelector)
      .from(sizeGuideTemplates)
      .where(where)
      .orderBy(orderAsc ? asc(column) : desc(column))
      .limit(limit)
      .offset(offset);

    return { success: true, data: { templates: rows as SizeGuideTemplate[], count } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message };
  }
}

export async function fetchBasicSizeGuideTemplatesAction(): Promise<{
  data: BasicSizeGuideTemplate[] | null;
  error: string | null;
}> {
  try {
    const rows = await db
      .select({ id: sizeGuideTemplates.id, name: sizeGuideTemplates.name })
      .from(sizeGuideTemplates)
      .orderBy(asc(sizeGuideTemplates.name));
    return { data: rows, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message };
  }
}

export async function fetchSizesFromSizeGuideAction(
  sizeGuideId: string,
): Promise<{ data: string[] | null; error: string | null }> {
  if (!sizeGuideId) return { data: [], error: null };
  try {
    const [row] = await db
      .select({ guideData: sizeGuideTemplates.guideData })
      .from(sizeGuideTemplates)
      .where(eq(sizeGuideTemplates.id, sizeGuideId))
      .limit(1);
    if (!row || !row.guideData) return { data: [], error: "Size guide data not found." };
    const guideData = row.guideData as { rows?: string[][] };
    const sizes = guideData.rows?.map((r) => r[0]).filter(Boolean) ?? [];
    return { data: sizes, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message };
  }
}
