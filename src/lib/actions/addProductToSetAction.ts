"use server";

import { revalidateTag } from "next/cache";

import { db } from "@/db";
import { setProducts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/authz";
import type { ActionResponse } from "@/types/actions";

export async function addProductToSetAction(
  setId: string,
  productId: string,
): Promise<ActionResponse> {
  if (!setId || !productId) {
    return { success: false, error: "Set ID and Product ID are required" };
  }
  try {
    await requireAdmin();
    await db.insert(setProducts).values({ setId, productId });
    revalidateTag(`set-products-${setId}`, "default");
    revalidateTag(`products`, "default");
    return { success: true, message: "Product added to set." };
  } catch (e) {
    const message = e instanceof Error ? e.message : "An unknown error occurred.";
    if (message.includes("duplicate") || message.includes("23505")) {
      return { success: false, error: "Product is already in this set." };
    }
    return { success: false, error: message };
  }
}
