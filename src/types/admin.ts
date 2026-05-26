import type { ProductRow, ProductImageRow, SetRow } from './db';
import type { Table } from "@tanstack/react-table";

export type AdminProductTableItem = ProductRow & {
    product_images: Pick<ProductImageRow, 'id' | 'image_url'>[] | null; 
    set?: Pick<SetRow, 'id' | 'name'> | null;
};

export type AdminProductTableSortKeys = keyof ProductRow | 'set.name' | undefined;

export interface UseProductDataTableReturn {
    table: Table<AdminProductTableItem>; 
    isLoading: boolean;
    error: string | null;
}

export interface ProductListClientProps {
  products: AdminProductTableItem[]; 
}

export interface UseProductListClientReturn {
  isDeleting: string | null;
  error: string | null;
  handleDelete: (productId: string, productName: string | null) => Promise<void>;
}

export type AspectRatioValue = 'square' | 'portrait' | 'video';

export interface UseAboutFormReturn {
    entityFormHook: any;
    selectedAspectRatio: AspectRatioValue;
    newStagedFiles: File[];
    currentImagesToDisplay: any[];
    imagesChanged: boolean;
    hasAtLeastOneImage: boolean;
    isSaveDisabled: boolean;
    handleImageMarkOrRemove: (id: string, isExisting: boolean) => void;
}

export interface UseProductFormProps {
    initialData?: any | null;
}

export interface SizeGuideTemplate {
    id: string;
    name: string;
    sizes: string[];
    created_at: string;
    updated_at: string;
}

export interface AdminSizeGuidesListResponseData {
    sizeGuides: SizeGuideTemplate[];
    total: number;
}

export interface UseAdminSizeGuidesListParams {
    page?: number;
    limit?: number;
}

export interface LayoutUpdateItemArgs {
    id: string;
    position?: number;
    content?: any;
}

export interface PageComponentType {
    text: 'text';
    about: 'about';
}

export interface HomeLayoutData {
    items: any[];
    version: number;
}

export interface LocalAvailableProductsData {
    products: any[];
    count: number | null;
}

export interface LocalAvailableProductsResult {
    success: boolean;
    message: string;
    data: LocalAvailableProductsData;
    error: string | null;
}

export interface UseManageSetProductsProps {
    setId: string;
    initialAssociatedProducts: any[];
}
