import { useFadeInAnimation } from '@/hooks/useFadeInAnimation';
import { getAspectRatioClass, filterValidImages, type AspectRatioType } from '@/lib/helpers/aspectRatioHelpers';

interface UseAboutSectionProps {
  images?: (string | null)[] | null;
  aspectRatio?: AspectRatioType | null;
}

export function useAboutSection({ images, aspectRatio = 'square' }: UseAboutSectionProps) {
  const validImages = filterValidImages(images);
  const itemAspectClass = getAspectRatioClass(aspectRatio);

  const titleAnimation = useFadeInAnimation<HTMLHeadingElement>({
    delay: 0,
    duration: 800,
    translateY: 30,
  });

  const textAnimation = useFadeInAnimation<HTMLParagraphElement>({
    delay: 200,
    duration: 800,
    translateY: 30,
  });

  const carouselAnimation = useFadeInAnimation<HTMLDivElement>({
    delay: 400,
    duration: 1000,
    translateX: 50,
    translateY: 0,
  });

  return {
    validImages,
    itemAspectClass,
    titleAnimation,
    textAnimation,
    carouselAnimation
  };
} 