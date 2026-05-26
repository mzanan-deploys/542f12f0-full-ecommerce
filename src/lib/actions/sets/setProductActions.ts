"use server";

import { asc, desc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import slugify from "slugify";

import { db } from "@/db";
import { setProducts, sets } from "@/db/schema";
import { setSelector } from "@/lib/db/selectors";
import { requireAdmin, verifyAdmin } from "@/lib/auth/serverAuth";
import type { ActionResponse } from "@/types/actions";
import type { SetRow } from "@/types/db";
import type { SelectOption } from "@/types/ui";

export async function addProductToSet(
  setId: string,
  productId: string,
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const [last] = await db
      .select({ position: setProducts.position })
      .from(setProducts)
      .where(eq(setProducts.setId, setId))
      .orderBy(desc(setProducts.position))
      .limit(1);
    const nextPosition = (last?.position ?? -1) + 1;

    await db.insert(setProducts).values({ setId, productId, position: nextPosition });
    revalidateTag(`set-${setId}-products`, "default");
    revalidatePath(`/admin/sets/${setId}/edit`);
    return { success: true, message: `Product ${productId} added` };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("duplicate") || message.includes("23505")) {
      return { success: false, error: "Product is already in this set." };
    }
    return { success: false, error: `Failed to add product: ${message}` };
  }
}

export async function getSetsForSelection(): Promise<ActionResponse<{ sets: SelectOption[] }>> {
  try {
    const rows = await db
      .select({ id: sets.id, name: sets.name, type: sets.type })
      .from(sets)
      .where(eq(sets.isActive, true))
      .orderBy(asc(sets.name));
    return {
      success: true,
      data: {
        sets: rows.map((c) => ({
          value: c.id,
          label: c.name,
          group: c.type ?? "Uncategorized",
        })),
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function updateSet(
  id: string,
  updates: Partial<Pick<SetRow, "name" | "description" | "is_active" | "type" | "layout_type" | "slug">>,
): Promise<{ success: boolean; message?: string; data?: SetRow }> {
  if (!id) return { success: false, message: "Set ID is required." };
  if (!(await verifyAdmin())) {
    return { success: false, message: "Admin authorization required." };
  }

  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.is_active !== undefined) dbUpdates.isActive = updates.is_active;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.layout_type !== undefined) dbUpdates.layoutType = updates.layout_type;
  if (updates.slug !== undefined) dbUpdates.slug = updates.slug;

  if (updates.name && !updates.slug) {
    dbUpdates.slug = slugify(updates.name, { lower: true, strict: true });
  }
  dbUpdates.updatedAt = new Date();

  try {
    await db.update(sets).set(dbUpdates).where(eq(sets.id, id));
    const [data] = await db
      .select(setSelector)
      .from(sets)
      .where(eq(sets.id, id))
      .limit(1);

    revalidateTag("sets", "default");
    revalidatePath("/admin/sets");
    revalidatePath("/admin/home-design");
    revalidatePath("/");
    if (data?.slug) {
      revalidateTag(`set-${data.slug}`, "default");
      revalidatePath(`/set/${data.slug}`);
    }
    return { success: true, message: "Set updated successfully.", data: data as SetRow };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("duplicate") && message.includes("slug")) {
      return { success: false, message: `Set slug '${dbUpdates.slug}' already exists.` };
    }
    return { success: false, message: `Database Error: ${message}` };
  }
}
