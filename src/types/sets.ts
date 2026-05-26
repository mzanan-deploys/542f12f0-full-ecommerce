import React from 'react';
import type { SetRow, ProductRow, ProductImageRow, VariantRow, ProductWithPosition } from './db';
import { type SetType } from '@/lib/schemas/setSchema';
import type { ActionResponse } from './actions';
import type { UseFormReturn } from 'react-hook-form';
import type { SetFormData } from '@/lib/schemas/setSchema';
import type { JsonValue } from '@/lib/schemas/sizeGuideTemplateSchema';

export type { SetType };

export interface PublicSetListItem extends Pick<SetRow, 'id' | 'name' | 'slug' | 'type' | 'description' | 'layout_type'> {
    image_urls?: string[];
}

export interface AdminSetListItem extends Pick<SetRow, 'id' | 'name' | 'slug' | 'is_active' | 'type' | 'created_at'> {
    product_count: number;
    image_url?: string | null;
}

export type ProductWithThumbnail = Pick<ProductRow, 'id' | 'name' | 'slug'> & {
    thumbnail_url: string | null;
};

export type SetPageProduct = Pick<ProductRow, 'id' | 'name' | 'slug' | 'price' | 'description' | 'stock_quantity' | 'is_active' | 'created_at' | 'updated_at' | 'category_id'> & {
    product_images: Array<Pick<ProductImageRow, 'id' | 'image_url' | 'alt_text' | 'position'> | { image_url: string; alt_text: string | null; position: number | null; id?: string; }>;
    images?: Array<Pick<ProductImageRow, 'id' | 'image_url' | 'alt_text' | 'position'> | { image_url: string; alt_text: string | null; position: number | null; id?: string; }>;
    product_variants: Array<Pick<VariantRow, 'id' | 'product_id' | 'size_name'> >;
    variants?: Array<Pick<VariantRow, 'id' | 'product_id' | 'size_name'> >;
    size_guide_data?: JsonValue | null;
};

export type SetPageData = SetRow & {
    products: SetPageProduct[] | null;
    set_images?: Pick<ProductImageRow, 'id' | 'image_url' | 'position' | 'alt_text'>[] | null;
};

export interface SetPageResult extends ActionResponse<SetPageData> {}

export interface AdminSetsListResult {
    success: boolean;
    error?: string | null;
    message?: string | null;
    data?: {
        sets: AdminSetListItem[];
        count: number | null;
    } | null;
}

export interface AvailableProductsResult extends ActionResponse<{
    products: ProductWithThumbnail[];
    count: number | null;
}> {}

export interface SetDeleteButtonProps {
  setId: string;
  setName: string;
  productCount: number;
}

export interface UseSetDeleteButtonReturn {
  isDeleting: boolean;
  handleDelete: () => Promise<void>;
}

export interface SetFormProps {
  set?: (SetRow & { set_images: any[] }) | null;
}

export interface ManageSetProductsProps {
  setId: string;
  initialAssociatedProducts: ProductWithPosition[]; 
}

export interface UseSetFormReturn extends UseFormReturn<SetFormData> {
  state: AdminCreateUpdateActionResponse;
  isPending: boolean;
  dispatchFormAction: (payload: FormData) => void;
  imagePreview: string | null;
  deleteCurrentImage: boolean;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  setDeleteCurrentImage: React.Dispatch<React.SetStateAction<boolean>>;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
  handleSlugChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export type ProductPositionData = {
    id: string;
    position: number;
};

export interface AdminSetsListParams {
    limit?: number;
    offset?: number;
    orderBy?: keyof SetRow;
    orderAsc?: boolean;
    filters?: Partial<Pick<SetRow, 'type' | 'is_active'> & { search?: string }>;
}

export interface AdminCreateUpdateActionResponse extends ActionResponse<SetRow> {}

export type SetFormServerAction = (prevState: ActionResponse<SetRow> | null, formData: FormData) => Promise<ActionResponse<SetRow>>;
