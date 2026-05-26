"use client";

import { deleteSetAction as deleteSetServerAction } from "@/lib/actions/deleteSetAction";
import type { ActionResponse } from "@/types/actions";

export async function deleteSetAction(id: string): Promise<ActionResponse<null>> {
  const result = await deleteSetServerAction(id);
  if (!result.success) return { success: false, error: result.error, message: result.message };
  return { success: true, data: null };
}
