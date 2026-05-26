"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { db } from "@/db";
import { setProducts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/authz";
import type { ActionResponse as BaseActionResponse } from "@/types/actions";
import type { ProductPositionData } from "@/types/sets";

export async function updateSetProductsAction(
  setId: string,
  productsJson: string,
): Promise<BaseActionResponse> {
  if (!setId) return { success: false, error: "Set ID is required." };

  let products: ProductPositionData[];
  try {
    products = JSON.parse(productsJson);
    if (!Array.isArray(products)) throw new Error("Input is not an array.");
    products.forEach((p, index) => {
      if (typeof p.id !== "string" || typeof p.position !== "number" || p.position < 0) {
        throw new Error(`Invalid data at index ${index}.`);
      }
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid input";
    return { success: false, error: `Invalid products data format: ${message}` };
  }

  try {
    await requireAdmin();
    await db.transaction(async (tx) => {
      for (const product of products) {
        await tx
          .update(setProducts)
          .set({ position: product.position })
          .where(and(eq(setProducts.setId, setId), eq(setProducts.productId, product.id)));
      }
    });

    revalidateTag(`set-${setId}-products`, "default");
    revalidatePath(`/admin/sets/${setId}/edit`);
    return { success: true, message: "Product positions updated successfully." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to update product positions: ${message}` };
  }
}
