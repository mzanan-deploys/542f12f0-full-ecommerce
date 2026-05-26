import type { SetLayoutType } from '@/lib/schemas/setSchema';

type DisplayImage = {
  isMarkedForDelete?: boolean;
};

const REQUIRED_IMAGES_BY_LAYOUT: Record<SetLayoutType, number> = {
  SINGLE_COLUMN: 1,
  SPLIT_SMALL_LEFT: 2,
  SPLIT_SMALL_RIGHT: 2,
  STAGGERED_THREE: 3,
  TWO_HORIZONTAL: 0,
};

export const validateSetImages = (
  displayImages: DisplayImage[],
  layoutType: SetLayoutType | null | undefined,
  isUpdate: boolean
): string | null => {
  const currentVisibleImageCount = displayImages.filter(img => !img.isMarkedForDelete).length;

  if (!isUpdate && currentVisibleImageCount === 0 && !layoutType) {
    return "At least one image is required to create a set.";
  }

  if (!layoutType) {
    if (!isUpdate && currentVisibleImageCount < 1) {
      return "At least one image is required.";
    }
    return null;
  }

  const requiredImages = REQUIRED_IMAGES_BY_LAYOUT[layoutType];
  
  if (requiredImages > 0 && currentVisibleImageCount < requiredImages) {
    const layoutName = layoutType.replace(/_/g, ' ').toLowerCase();
    return `${layoutName} layout requires at least ${requiredImages} image(s). You have ${currentVisibleImageCount}.`;
  }

  return null;
};



