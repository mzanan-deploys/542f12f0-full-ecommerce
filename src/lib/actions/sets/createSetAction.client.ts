"use client";

import { createSetAction as createSetServerAction } from "@/lib/actions/sets/createSetAction";
import type { ActionResponse } from "@/types/actions";
import type { SetRow } from "@/types/db";

export async function createSetAction(
  prevState: ActionResponse<SetRow> | null,
  formData: FormData,
): Promise<ActionResponse<SetRow>> {
  return createSetServerAction(prevState as ActionResponse | null, formData);
}
