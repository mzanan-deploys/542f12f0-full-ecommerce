import type { ActionResponse } from '@/types/actions';
import type { SetRow, SetImageRow, ProductRow, ProductWithPosition } from '@/types/db';
import type { SelectOption } from '@/types/ui';
import type { 
    PublicSetListItem, 
    AdminSetListItem, 
    ProductWithThumbnail,
    SetPageProduct,
    SetPageData, 
    SetPageResult, 
    AdminSetsListResult, 
    AvailableProductsResult 
} from '@/types/sets';

export type { SetImageRow };

export interface UploadedSetImageInfo {
    tempId: string;
    url: string;
    path: string;
}

export interface PublicSetsListResult {
    success: boolean;
    data?: { sets: PublicSetListItem[] };
    error?: string;
}

export interface AdminSetsListParams {
    limit?: number;
    offset?: number;
    orderBy?: keyof SetRow;
    orderAsc?: boolean;
    filters?: Partial<Pick<SetRow, 'type' | 'is_active'> & { name?: string }>;
}

export interface AvailableProductsParams {
    limit?: number;
    offset?: number;
    search?: string;
}

export interface UpdateSetParams {
    id: string;
    updates: Partial<Pick<SetRow, 'name' | 'description' | 'is_active' | 'type' | 'layout_type' | 'slug'>>;
}

export type { SetRow, ProductRow, ProductWithPosition };
export type { ActionResponse };
export type { SelectOption };
export type { 
    PublicSetListItem, 
    AdminSetListItem, 
    ProductWithThumbnail,
    SetPageProduct,
    SetPageData, 
    SetPageResult, 
    AdminSetsListResult, 
    AvailableProductsResult 
}; 