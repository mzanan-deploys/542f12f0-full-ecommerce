'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import ProductCard from '@/components/ecommerce/products/ProductCard/ProductCard';
import { WheelScrollableArea } from '@/components/shared/WheelScrollableArea/WheelScrollableArea';
import type { SetPageProduct } from '@/lib/actions/setActions';
import { useScrollRestorationContext } from '@/components/providers/ScrollRestorationProvider';
import { useTheme } from 'next-themes';
import { useImagePreloader, extractImageUrls } from '@/hooks/useImagePreloader';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { ProductImageRow } from '@/types/db';
import type { SetPageData } from "@/types/sets";

type SetProductForDisplay = SetPageProduct & { price: number | string };

interface SetDisplayProps {
  set: SetPageData;
}

const SetHeader = React.memo(({ name, description }: { name: string; description?: string | null }) => (
  <div id="set-title" className='flex-col gap-1 flex lg:hidden text-left w-full'>
    <h1 className="text-3xl font-bold">{name}</h1>
    {description && (
      <p className="text-base md:text-lg text-muted-foreground">
        {description}
      </p>
    )}
  </div>
));

const SetHeaderDesktop = React.memo(({ name, description }: { name: string; description?: string | null }) => (
  <div className='flex-col gap-1 hidden lg:flex text-left'>
    <h1 className="text-3xl font-bold">{name}</h1>
    {description && (
      <p className="text-base md:text-lg text-muted-foreground">
        {description}
      </p>
    )}
  </div>
));

const FocusedProductImage = React.memo(({ image }: { image: Pick<ProductImageRow, 'image_url' | 'alt_text'> }) => (
  <div className="relative aspect-[9/16] w-full h-full rounded-lg overflow-hidden">
    <Image
      src={image.image_url}
      alt={image.alt_text || 'Focused product image'}
      fill
      className="object-cover rounded-lg"
      sizes="(max-width: 1024px) 100vw, 557px"
      priority
    />
  </div>
));

const ThumbnailButton = React.memo(({
  image,
  index,
  isActive,
  onClick
}: {
  image: { id?: string; image_url: string; alt_text: string },
  index: number,
  isActive: boolean,
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`relative h-16 md:h-20 aspect-square grow-0 shrink basis-16 md:basis-20 rounded-md overflow-hidden border-2 transition-all
                ${isActive ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50'}`}
  >
    <Image
      src={image.image_url}
      alt={`Thumbnail ${image.alt_text || index + 1}`}
      fill
      className="object-cover"
      sizes="80px"
      loading="lazy"
    />
  </button>
));

export default function SetDisplay({ set }: SetDisplayProps) {
  if (!set) return <p>Set data is not available.</p>;
  if (!set.products || set.products.length === 0) {
    return <p>No products available for this set.</p>;
  }

  const [focusedProductImage, setFocusedProductImage] = useState<Pick<ProductImageRow, 'image_url' | 'alt_text'> | null>(null);
  const scrollableViewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportReady, setViewportReady] = useState(false);
  const { isInitialLoadInSession } = useScrollRestorationContext();
  const { setTheme } = useTheme();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const allImageUrls = useMemo(() => {
    return extractImageUrls(set);
  }, [set]);

  useImagePreloader(allImageUrls, { enabled: true, priority: true });

  const displayImages = useMemo(() => {
    const sortedSetImages = set.set_images?.slice().sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)) || [];

    let images: Array<{ image_url: string; alt_text: string; id?: string }> = [];
    if (sortedSetImages.length > 0) {
      images = sortedSetImages.map((img) => ({
        image_url: img.image_url,
        alt_text: img.alt_text || set.name || 'Set image',
        id: img.id
      }));
    } else if (set.products?.[0]?.product_images?.[0]?.image_url) {
      images.push({
        image_url: set.products[0].product_images[0].image_url,
        alt_text: set.products[0].name || 'Product image'
      });
    } else {
      images.push({
        image_url: '/placeholder-image.svg',
        alt_text: 'Placeholder image'
      });
    }
    return images;
  }, [set.set_images, set.products, set.name]);

  useEffect(() => {
    if (!carouselApi) return;

    const onSetCarouselSelectOrSettle = () => {
      setFocusedProductImage(null);
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSetCarouselSelectOrSettle);
    carouselApi.on("settle", onSetCarouselSelectOrSettle);

    if (!focusedProductImage) {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    }

    return () => {
      carouselApi.off("select", onSetCarouselSelectOrSettle);
      carouselApi.off("settle", onSetCarouselSelectOrSettle);
    };
  }, [carouselApi, focusedProductImage]);

  useEffect(() => {
    if (set.type === 'NIGHT') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, [set.type, setTheme]);

  const handleViewportRef = useCallback((ref: HTMLDivElement | null) => {
    if (ref) {
      scrollableViewportRef.current = ref;
      if (!viewportReady) {
        setViewportReady(true);
      }
    } else {
      scrollableViewportRef.current = null;
      if (viewportReady) {
        setViewportReady(false);
      }
    }
  }, [viewportReady]);

  useEffect(() => {
    const viewportEl = scrollableViewportRef.current;
    const slug = set.slug;

    if (!viewportEl || !slug || !viewportReady) {
      return;
    }

    const localStorageKey = `setScrollPos-${slug}`;
    const navigationEntries = typeof window !== 'undefined' ? performance.getEntriesByType("navigation") : [];
    const navigationType = navigationEntries.length > 0 ? (navigationEntries[0] as PerformanceNavigationTiming).type : null;

    let shouldRestore = false;
    if (navigationType === 'reload') {
      shouldRestore = true;
    } else if (!isInitialLoadInSession) {
      shouldRestore = true;
    }

    if (shouldRestore) {
      const savedScrollTopString = localStorage.getItem(localStorageKey);
      if (savedScrollTopString) {
        const savedScrollTopInt = parseInt(savedScrollTopString, 10);
        if (!isNaN(savedScrollTopInt)) {
          viewportEl.scrollTop = savedScrollTopInt;
        }
      }
    }

    return () => {
      if (viewportEl) {
        localStorage.setItem(localStorageKey, String(viewportEl.scrollTop));
      }
    };
  }, [set.slug, viewportReady, isInitialLoadInSession]);

  const handleProductSelect = useCallback((product: SetProductForDisplay, imageIndex?: number) => {
    const selectedImage = imageIndex !== undefined && product.product_images?.[imageIndex]
      ? product.product_images[imageIndex]
      : product.product_images?.[0];
    setFocusedProductImage(selectedImage || null);

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const setTitleElement = document.getElementById('set-title');
      if (setTitleElement) {
        const elementTop = setTitleElement.offsetTop;
        const offset = 65;
        window.scrollTo({
          top: elementTop - offset,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    setFocusedProductImage(null);
    carouselApi?.scrollTo(index);
  }, [carouselApi]);

  return (
    <div className="flex flex-col items-center gap-8 lg:gap-0 lg:flex-row lg:items-start p-10 lg:h-[calc(100vh-var(--header-height))] lg:max-h-[1168px]">
      <SetHeader name={set.name} description={set.description} />

      <div className="flex flex-col items-center lg:items-start w-full lg:w-auto lg:h-full max-w-[432px] lg:max-w-[557px]">
        {focusedProductImage ? (
          <FocusedProductImage image={focusedProductImage} />
        ) : (
          <Carousel
            setApi={setCarouselApi}
            className="relative aspect-[9/16] w-full h-full lg:w-full rounded-lg overflow-hidden"
            opts={{ loop: displayImages.length > 1 }}
          >
            <CarouselContent>
              {displayImages.map((image, index) => (
                <CarouselItem key={image.id || image.image_url || index} className="relative aspect-[9/16] w-full h-full">
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || `Set image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 1024px) 100vw, 557px"
                    priority={index === 0 && displayImages.length <= 3}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {displayImages.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80 text-foreground" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80 text-foreground" />
              </>
            )}
          </Carousel>
        )}

        {displayImages.length > 1 && (
          <div className="flex justify-center gap-2 mt-4 w-full px-1 pb-1">
            {displayImages.map((image, index) => (
              <ThumbnailButton
                key={`thumb-${image.id || image.image_url || index}`}
                image={image}
                index={index}
                isActive={index === currentSlide && !focusedProductImage}
                onClick={() => handleThumbnailClick(index)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between lg:pl-8 lg:pt-0 overflow-hidden lg:h-full">
        <SetHeaderDesktop name={set.name} description={set.description} />

        <WheelScrollableArea
          className="lg:pb-4 lg:-mr-8 lg:pr-8"
          getViewportRef={handleViewportRef}
        >
          <div className="w-full flex justify-center">
            <div className="flex flex-col md:flex-row flex-wrap lg:flex-nowrap justify-start lg:items-end gap-6 pt-4 md:max-lg:max-w-[564px] w-full">
              {set.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductSelect={handleProductSelect}
                />
              )
              )}
            </div>
          </div>
        </WheelScrollableArea>
      </div>
    </div>
  );
} 