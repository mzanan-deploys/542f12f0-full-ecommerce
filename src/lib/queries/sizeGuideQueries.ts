import { useQuery } from "@tanstack/react-query";

import { useCacheStore } from "@/store/cacheStore";
import { getAdminSizeGuidesList as getAdminSizeGuidesListAction } from "@/lib/actions/sizeGuideActions";
import type {
  AdminSizeGuidesListResponse,
  SizeGuideTemplateExtended,
  UseAdminSizeGuidesListParams,
} from "@/types/sizeGuide";

export interface SizeGuideTemplate {
  id: string;
  name: string;
  guide_data: unknown;
  created_at: string;
  updated_at: string;
}

async function fetchSizeGuideTemplates(): Promise<SizeGuideTemplate[]> {
  const res = await fetch("/api/size-guide-templates", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load size guide templates (${res.status})`);
  }
  return (await res.json()) as SizeGuideTemplate[];
}

export function useSizeGuidesTable() {
  const cache = useCacheStore();
  const cacheKey = "size-guide-templates";

  const {
    data: templates = [],
    isLoading,
    error,
    refetch,
  } = useQuery<SizeGuideTemplate[], Error>({
    queryKey: ["sizeGuideTemplates"],
    queryFn: async () => {
      const cached = cache.get<SizeGuideTemplate[]>(cacheKey);
      if (cached) return cached;

      const data = await fetchSizeGuideTemplates();
      cache.set(cacheKey, data, 5 * 60 * 1000);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { templates, isLoading, error, refetch };
}

async function wrappedGetAdminSizeGuidesList(
  params: UseAdminSizeGuidesListParams,
): Promise<AdminSizeGuidesListResponse> {
  const result = await getAdminSizeGuidesListAction(params);
  if (!result.success || !result.data) {
    return result as AdminSizeGuidesListResponse;
  }
  const convertedTemplates: SizeGuideTemplateExtended[] = result.data.templates.map(
    (template) => ({
      id: template.id,
      name: template.name,
      guide_data: template.guide_data as unknown,
      created_at: template.created_at,
      updated_at: template.updated_at,
    }),
  );
  return {
    success: true,
    data: { templates: convertedTemplates, count: result.data.count },
  };
}

export function useAdminSizeGuidesList(params: UseAdminSizeGuidesListParams) {
  const cache = useCacheStore();
  const cacheKey = `admin-size-guides-${JSON.stringify(params)}`;
  return useQuery<AdminSizeGuidesListResponse, Error>({
    queryKey: ["adminSizeGuides", params],
    queryFn: async () => {
      const cached = cache.get<AdminSizeGuidesListResponse>(cacheKey);
      if (cached) return cached;
      const data = await wrappedGetAdminSizeGuidesList(params);
      cache.set(cacheKey, data, 5 * 60 * 1000);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
