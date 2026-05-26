"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { db } from "@/db";
import { setProducts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/authz";
import type { ActionResponse } from "@/types/actions";

export async function removeProductFromSetAction(
  setId: string,
  productId: string,
): Promise<ActionResponse> {
  if (!setId || !productId) {
    return { success: false, error: "Set ID and Product ID are required." };
  }
  try {
    await requireAdmin();
    await db
      .delete(setProducts)
      .where(and(eq(setProducts.setId, setId), eq(setProducts.productId, productId)));
    revalidateTag(`set-${setId}-products`, "default");
    revalidatePath(`/admin/sets/${setId}/edit`);
    return { success: true, message: `Product ${productId} removed` };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to remove product: ${message}` };
  }
}
