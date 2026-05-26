import { getAdminSetsList as getAdminSetsListServer } from "@/lib/queries/setQueries.server";
import type { AdminSetsListResult } from "@/types/sets";
import type { AdminSetsListParams } from "@/types/setActions";

export const getAdminSetsList = async (
  params: AdminSetsListParams = {},
): Promise<AdminSetsListResult> => {
  return getAdminSetsListServer(params);
};
