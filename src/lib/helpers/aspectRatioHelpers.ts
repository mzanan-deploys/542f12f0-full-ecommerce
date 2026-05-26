export type AspectRatioType = 'square' | 'portrait' | 'video';

export const getAspectRatioClass = (aspectRatio?: AspectRatioType | null): string => {
    switch (aspectRatio) {
        case 'video':
            return 'aspect-video';
        case 'portrait':
            return 'aspect-[9/16]';
        case 'square':
        default:
            return 'aspect-square';
    }
};

export const filterValidImages = (images?: (string | null)[] | null): string[] => {
    return images?.filter((img): img is string => typeof img === 'string' && img.trim() !== '') || [];
}; 