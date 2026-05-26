"use client";

import { updateSetAction as updateSetServerAction } from "@/lib/actions/sets/updateSetAction";
import type { ActionResponse } from "@/types/actions";
import type { SetRow } from "@/types/db";

export async function updateSetAction(
  setId: string,
  prevState: ActionResponse<SetRow> | null,
  formData: FormData,
): Promise<ActionResponse<SetRow>> {
  const result = await updateSetServerAction(setId, prevState as ActionResponse | null, formData);
  if (!result.success) {
    return { success: false, error: result.error, message: result.message };
  }
  return { success: true, data: { id: setId } as SetRow };
}
