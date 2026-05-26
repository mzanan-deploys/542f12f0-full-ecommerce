"use client";

import {
  getAvailableProductsForSetAction,
  getProductsInSetAction,
} from "@/lib/queries/setQueries.server";
import { updateSet as updateSetServer } from "@/lib/actions/sets/setProductActions";
import type { ActionResponse } from "@/types/actions";
import type { ProductWithPosition, SetRow } from "@/types/db";
import type { AvailableProductsResult } from "@/types/sets";

export async function updateSet(
  id: string,
  updates: Partial<SetRow>,
): Promise<ActionResponse<SetRow>> {
  const result = await updateSetServer(id, updates);
  if (!result.success) return { success: false, error: result.message };
  return { success: true, data: result.data };
}

export async function getProductsInSet(
  setId: string,
): Promise<ActionResponse<{ products: ProductWithPosition[] }>> {
  return getProductsInSetAction(setId);
}

export async function getAvailableProductsForSetPaginated(
  setId: string,
): Promise<AvailableProductsResult> {
  return getAvailableProductsForSetAction(setId);
}
