import type { ProductCategoryRow as BaseProductCategoryRow } from "@/types/db";

export type ProductCategoryRow = BaseProductCategoryRow & {
  size_guide_templates?: {
    name: string;
  } | null;
};
