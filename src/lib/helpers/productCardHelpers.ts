export type AvailableVariant = {
    id: string;
    size: string; 
    dbStock: number; 
    effectiveStock: number; 
    isAvailable: boolean;
    product_id: string; 
};

export const getAvailableSizesFromGuide = (sizeGuideData: any): string[] | null => {
    if (!sizeGuideData) return null;
    
    try {
        let parsedData = sizeGuideData;
        if (typeof sizeGuideData === 'string') {
            parsedData = JSON.parse(sizeGuideData);
        }
        
        if (
            parsedData && 
            typeof parsedData === 'object' &&
            Array.isArray(parsedData.rows)
        ) {
            const sizes = parsedData.rows.map((row: string[]) => row[0]).filter(Boolean);
            return sizes;
        }
    } catch (error) {
        console.error("Error parsing size guide data:", error);
    }
    
    return null;
};

export const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL'];

export const sortVariantsBySize = (variants: AvailableVariant[]): AvailableVariant[] => {
    return variants.sort((a, b) => {
        const aIndex = SIZE_ORDER.indexOf(a.size);
        const bIndex = SIZE_ORDER.indexOf(b.size);
        
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        return a.size.localeCompare(b.size);
    });
};

export const calculateTotalQuantityInCart = (cartItems: any[], productId: string): number => {
    return cartItems
        .filter(item => item.productId === productId)
        .reduce((sum, item) => sum + item.quantity, 0);
};

export const calculateEffectiveStock = (baseStock: number, quantityInCart: number): number => {
    return Math.max(0, baseStock - quantityInCart);
};

export const sortImagesByPosition = (images: any[]): any[] => {
    return images
        ?.filter((img): img is any => img?.image_url !== null)
        .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)) ?? [];
};

export const getDisplayImages = (images: any[]): any[] => {
    const sortedImages = sortImagesByPosition(images);
    return sortedImages.length > 0 ? sortedImages : [{ 
        image_url: '/placeholder-image.svg', 
        alt_text: 'Placeholder Image' 
    }];
}; 