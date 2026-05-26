export interface SetMetadataData {
    name: string;
    description?: string | null;
    set_images?: Array<{ image_url: string }>;
    products?: Array<{
        product_images?: Array<{ image_url: string }>;
    }>;
} 