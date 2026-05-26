import type { ProductRow, ProductImageRow, ProductCategoryRow as DBCategoryRow, VariantRow } from './db';
import type { ActionResponse } from './actions';
import type { ProductFormData } from '@/lib/schemas/productSchema';
import type { UseFormSetValue } from 'react-hook-form';
import type { SelectOption } from './ui';


interface NewVariantRow {
    id: string;
    product_id: string;
    size_name: string;
}

export interface CategorySizeRow {
    id: string;
    category_id: string;
    size_name: string;
    display_order: number | null;
}

export type ProductImage = {
    image_url: string | null;
    alt_text?: string | null;
    position?: number | null;
};

export type ProductVariant = {
    id: string;
    size_name: string | null;
};

export type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string; 
    product_images: ProductImage[] | null;
    product_variants?: ProductVariant[] | null;
    size_guide_data?: any;
  };
  onClick?: () => void;
};

export interface ProductGalleryClientProps {
  images: Pick<ProductImageRow, 'id' | 'image_url' | 'alt_text'>[] | null;
  productName?: string | null; 
}

export type ProductVariantInfo = Pick<NewVariantRow, 'id' | 'size_name'>;

export interface ProductInfoActionsProps {
  product: Pick<ProductPageData, 'id' | 'name' | 'description' | 'price' | 'product_images'>; 
  variants: ProductVariantInfo[] | null;
}

export type ProductWithIncludes = ProductRow & {
    product_images: ProductImageRow[]; 
    product_variants: NewVariantRow[];
};

export type ProductListResponseData = {
  products: ProductWithIncludes[];
  totalPages: number | null;
  count: number;
};

export type ProductListResponse = ActionResponse<ProductListResponseData>;

export type ProductPageData = Omit<ProductRow, 'size_guide_template_id'> & {
    product_images: ProductImageRow[];
    product_variants: Pick<NewVariantRow, 'id' | 'size_name'>[];
    set_products: { set_id: string }[];
};

interface NestedSizeGuideTemplate {
    id: string;
    name: string;
}

export type ProductCategoryForEdit = Pick<DBCategoryRow, 'id' | 'name' | 'size_guide_id'> & {
    size_guide_template?: NestedSizeGuideTemplate | null;
};

export type ProductForEdit = Omit<ProductRow, 'size_guide_template_id'> & {
    images: ProductImageRow[];
    selected_size_names: string[];
    currentSetIds: string[];

    category_id: string | null; 
    category?: ProductCategoryForEdit | null;
    stock_quantity: number | null;
};

export interface ProductByIdEditResponse extends ActionResponse<ProductForEdit> {}

export type ImageItem = {
    id: string;
    url: string;
    file?: File;
    isExisting: boolean;
    isMarkedForDelete?: boolean;
    originalIndex?: number;
};

export interface SortableImageProps {
    item: ImageItem;
    onMarkDelete?: (id: string) => void;
    onRemoveStaged?: (id: string) => void;
    isPending: boolean;
}

export interface ProductFormProps {
    initialData?: ProductForEdit | null | undefined;
    availableSets?: SelectOption[];
}

export interface UseProductImageManagementProps {
    initialImages?: { id: string; image_url: string }[];
    setValue?: UseFormSetValue<ProductFormData>; 
}

export type ProductWithJoinData = ProductRow & {
    product_images: ProductImageRow[] | null;
    product_variants: VariantRow[] | null;
    set_products: { set_id: string }[] | null;
    product_categories: (DBCategoryRow & {
        size_guide_templates: { id: string; name: string; guide_data: unknown } | null;
    }) | null;
};

