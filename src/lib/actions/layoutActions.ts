"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { homepageLayout, pageComponents, sets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/authz";

type LayoutOrderItem = {
  item_id: string;
  display_order: number;
  item_type: "page_component" | "set";
  page_path: string;
};

export async function updateHomepageLayoutOrder(
  items: LayoutOrderItem[],
): Promise<{ success: boolean; message?: string }> {
  if (!items || items.length === 0) return { success: true, message: "No items to update." };

  try {
    await requireAdmin();
    const pagePath = items[0]?.page_path || "/";

    await db.transaction(async (tx) => {
      await tx
        .delete(homepageLayout)
        .where(eq(homepageLayout.pagePath, pagePath));

      await tx.insert(homepageLayout).values(
        items.map((item) => ({
          itemId: item.item_id,
          itemType: item.item_type,
          displayOrder: item.display_order,
          pagePath,
        })),
      );
    });

    revalidatePath("/");
    revalidatePath("/admin/home-design");
    return { success: true, message: "Layout order updated successfully." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Database error: ${message}` };
  }
}

export async function syncHomepageLayout(
  pagePath: string = "/",
): Promise<{ success: boolean; message?: string; addedCount?: number; removedCount?: number }> {
  let addedCount = 0;
  try {
    await requireAdmin();

    const currentLayout = await db
      .select({ itemId: homepageLayout.itemId, itemType: homepageLayout.itemType })
      .from(homepageLayout)
      .where(eq(homepageLayout.pagePath, pagePath));
    const layoutMap = new Map(currentLayout.map((item) => [`${item.itemType}:${item.itemId}`, true]));

    const activeComponents = await db
      .select({ id: pageComponents.id })
      .from(pageComponents)
      .where(and(eq(pageComponents.pagePath, pagePath), eq(pageComponents.isActive, true)));

    const activeSets = await db
      .select({ id: sets.id })
      .from(sets)
      .where(eq(sets.isActive, true));

    const missingItems: Array<{ itemId: string; itemType: "page_component" | "set" }> = [];
    for (const comp of activeComponents) {
      if (!layoutMap.has(`page_component:${comp.id}`)) {
        missingItems.push({ itemId: comp.id, itemType: "page_component" });
      }
    }
    for (const set of activeSets) {
      if (!layoutMap.has(`set:${set.id}`)) {
        missingItems.push({ itemId: set.id, itemType: "set" });
      }
    }

    if (missingItems.length > 0) {
      const [last] = await db
        .select({ order: homepageLayout.displayOrder })
        .from(homepageLayout)
        .where(eq(homepageLayout.pagePath, pagePath))
        .orderBy(desc(homepageLayout.displayOrder))
        .limit(1);
      let nextOrder = (last?.order ?? -1) + 1;

      await db.insert(homepageLayout).values(
        missingItems.map((item) => ({
          itemId: item.itemId,
          itemType: item.itemType,
          pagePath,
          displayOrder: nextOrder++,
        })),
      );
      addedCount = missingItems.length;
    }

    if (addedCount > 0) {
      revalidatePath("/");
      revalidatePath("/admin/home-design");
      return { success: true, message: `Synchronized. Added ${addedCount} items.`, addedCount };
    }
    return { success: true, message: "Layout is already up-to-date.", addedCount: 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Sync Error: ${message}` };
  }
}

export async function deleteHomepageItem(
  itemId: string,
  itemType: "page_component" | "set",
): Promise<{ success: boolean; message?: string }> {
  if (!itemId || !itemType) {
    return { success: false, message: "Item ID and Type are required." };
  }
  try {
    await requireAdmin();

    await db
      .delete(homepageLayout)
      .where(and(eq(homepageLayout.itemId, itemId), eq(homepageLayout.pagePath, "/")));

    if (itemType === "page_component") {
      await db.delete(pageComponents).where(eq(pageComponents.id, itemId));
    } else {
      await db.delete(sets).where(eq(sets.id, itemId));
    }

    revalidatePath("/");
    revalidatePath("/admin/home-design");
    return { success: true, message: "Item deleted successfully." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Server Error: ${message}` };
  }
}
