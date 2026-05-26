import type { ActionResponse } from "@/types/actions";
import type { FetchDataParams } from "@/types/adminDataTable";

export interface SizeGuideTemplate {
  id: string;
  name: string;
  guide_data: unknown;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

export type BasicSizeGuideTemplate = Pick<SizeGuideTemplate, "id" | "name">;

export interface SizeGuideTemplateExtended {
  id: string;
  name: string;
  guide_data: unknown;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

export interface AdminSizeGuidesListResponseData {
  templates: SizeGuideTemplateExtended[];
  count: number | null;
}

export type AdminSizeGuidesListResponse = ActionResponse<AdminSizeGuidesListResponseData>;

export type UseAdminSizeGuidesListParams = FetchDataParams;
