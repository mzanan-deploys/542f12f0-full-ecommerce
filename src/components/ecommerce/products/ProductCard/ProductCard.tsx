'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Minus, Plus, HelpCircle, Slash } from 'lucide-react';
import { useProductCard } from './useProductCard';
import type { ProductCardProps } from '@/types/product';
import type { SetPageProduct } from '@/types/sets';
import { AddToCartButton } from '@/components/ecommerce/products/AddToCartButton/AddToCartButton';
import { cn } from '@/lib/utils/cn';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


interface ExtendedProductCardProps {
  product: ProductCardProps['product'];
  onProductSelect?: (product: SetPageProduct, imageIndex?: number) => void;
  className?: string;
}

interface ProductCardInternalProps {
  product: ProductCardProps['product'];
  onProductSelect?: (product: SetPageProduct, imageIndex?: number) => void;
  className?: string;
}

function parseSizeGuideData(data: any): { headers: string[], rows: string[][] } | null {
  if (!data) return null;
  try {
    let parsedData = data;
    if (typeof data === 'string') {
      parsedData = JSON.parse(data);
    }
    if (
      parsedData && 
      typeof parsedData === 'object' &&
      Array.isArray(parsedData.headers) && 
      parsedData.headers.every((h: any) => typeof h === 'string') &&
      Array.isArray(parsedData.rows) &&
      parsedData.rows.every((r: any) => Array.isArray(r) && r.every((c: any) => typeof c === 'string')) &&
      parsedData.rows.every((r: any) => r.length === parsedData.headers.length)
    ) {
      return parsedData as { headers: string[], rows: string[][] };
    } else {
      console.warn("Invalid size guide data structure:", parsedData);
      return null;
    }
  } catch (error) {
    console.error("Error parsing size guide data:", error);
    return null;
  }
}

const ProductCardInternal = React.memo(function ProductCardInternal({ product, onProductSelect, className }: ProductCardInternalProps) {
  const {
    selectedVariantId,
    quantity,
    currentSlide,
    slideCount,
    availableVariants,
    displayImages,
    formattedPrice,
    selectedVariantStock,
    setApi,
    scrollTo,
    setSelectedVariantId,
    handleQuantityChange,
    storeIsHydrated,
    stockLoading
  } = useProductCard(product);

  const handleCardClick = React.useCallback((imageIndex?: number) => {
    if (onProductSelect) {
      onProductSelect(product as unknown as SetPageProduct, imageIndex);
    }
  }, [onProductSelect, product]);

  const sizeGuide = React.useMemo(() => parseSizeGuideData(product.size_guide_data), [product.size_guide_data]);

  return (
    <Card className={cn('p-0 w-[270px]', className, onProductSelect && 'cursor-pointer')}>
      <CardHeader className='p-0'>
        <div aria-label={`View details for ${product.name}`}>
          <Carousel
            setApi={setApi}
            opts={{ loop: displayImages.length > 1 }}
          >
            <CarouselContent>
              {displayImages.map((image, index) => (
                <CarouselItem key={index} onClick={onProductSelect ? () => handleCardClick(index) : undefined}>
                  <div className="relative aspect-square">
                    <Image
                      src={image.image_url || "/placeholder-image.png"}
                      alt={image.alt_text || `${product.name} image ${index + 1}`}
                      fill
                      className="object-cover rounded-t-xl"
                      sizes="270px"
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {displayImages.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2 z-10">
                  {Array.from({ length: slideCount }).map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        scrollTo(index); 
                      }}
                      className={`h-2 w-2 rounded-full transition-colors border border-black/20 shadow-sm ${
                        index === currentSlide
                          ? 'bg-primary'
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </Carousel>
        </div>
      </CardHeader>

      <CardContent>
        <h3 className="text-lg font-semibold mb-1 h-14" title={product.name}>
          {product.name}
        </h3>
        <span className="text-lg font-bold mb-4">{formattedPrice}</span>

        {!storeIsHydrated ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="flex flex-wrap gap-2">
              <div className="h-9 w-12 bg-gray-300 rounded-md"></div>
              <div className="h-9 w-12 bg-gray-300 rounded-md"></div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-1/4 mt-4"></div>
            <div className="flex items-center">
              <div className="h-9 w-9 bg-gray-300 rounded"></div>
              <div className="h-9 w-12 bg-gray-300 rounded-lg mx-1"></div>
              <div className="h-9 w-9 bg-gray-300 rounded"></div>
            </div>
          </div>
        ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1 mb-1">
            <label className="text-sm font-medium">Size:</label>
              {sizeGuide && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                      <HelpCircle className="h-5 w-5" />
                      <span className="sr-only">Size Guide</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto max-w-sm md:max-w-md p-2">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b font-semibold text-left">
                                {sizeGuide.headers.map((header, idx) => (
                                <th key={idx} className="pb-1 px-1">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sizeGuide.rows.map((row, rowIndex) => (
                              <tr key={rowIndex} className="border-b last:border-b-0 even:bg-gray-100 dark:even:bg-gray-800">
                                {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="py-0.5 px-1">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableVariants.map((variant) => {
                  const isOutOfStock = !variant.isAvailable;
                  const isSelected = selectedVariantId === variant.id;
                  
                  const buttonItself = (
                    <Button
                      key={variant.id}
                      variant={isSelected && !isOutOfStock ? "default" : "outline"}
                      className={cn(
                        'h-9 px-3 rounded-md text-xs relative',
                        isOutOfStock && 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-70',
                        isSelected && isOutOfStock && 'ring-2 ring-destructive ring-offset-2'
                      )}
                      onClick={() => {
                          if (!isOutOfStock) {
                              setSelectedVariantId(variant.id);
                          }
                      }}
                      disabled={isOutOfStock}
                      aria-label={isOutOfStock ? `${variant.size} (Out of stock)` : variant.size}
                    >
                      {variant.size}
                      {isOutOfStock && (
                        <Slash className="absolute h-full w-full text-destructive/70" strokeWidth={1.5} />
                      )}
                    </Button>
                  );
                  
                  if (isOutOfStock) {
                    return (
                      <div key={variant.id} className="relative group">
                        {buttonItself}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          Out of stock
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    );
                  }

                  return buttonItself;
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Quantity:</label>
              {stockLoading && (
                <span className="text-xs text-muted-foreground">Updating stock...</span>
              )}
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={!selectedVariantId || quantity <= 1 || selectedVariantStock === 0 || stockLoading}
              >
                <Minus className="h-4 w-4" />
              </Button>
                <div
                  className={cn(
                    "h-9 w-12 text-center flex items-center justify-center border border-input text-sm rounded-lg",
                    (!selectedVariantId || selectedVariantStock === 0) ? "bg-muted opacity-70 cursor-not-allowed" : "bg-background",
                    stockLoading && "opacity-50"
                  )}
                aria-label="Quantity"
                >
                  {selectedVariantStock === 0 && !selectedVariantId ? '-' : quantity} 
                </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={!selectedVariantId || quantity >= selectedVariantStock || selectedVariantStock === 0 || stockLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {(selectedVariantStock <= 5 && selectedVariantStock > 0 && !stockLoading) ? (
              <p className="text-xs text-amber-600 mt-1 h-4">Only {selectedVariantStock} left in stock!</p>
            ) : (
              <div className="h-4"></div>
            )}
          </div>
        </div>
        )}
      </CardContent>

      <CardFooter>
        {!storeIsHydrated ? (
          <div className="h-10 bg-gray-300 rounded w-full mb-2 animate-pulse"></div>
        ) : (
        <AddToCartButton
          variantId={selectedVariantId || ''}
          productName={product.name}
          productPrice={typeof product.price === 'string' ? parseFloat(product.price) : product.price}
          productImageUrl={product.product_images?.[0]?.image_url}
          availableStock={selectedVariantStock}
          quantity={quantity}
          disabled={availableVariants.length === 0 || !selectedVariantId || quantity === 0 || selectedVariantStock === 0}
          className='w-full mb-2'
        />
        )}
      </CardFooter>
    </Card>
  );
});

export default function ProductCard({ product, onProductSelect, className }: ExtendedProductCardProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className={cn('p-0 w-[270px] aspect-[3/4] bg-muted rounded-xl', className)}></div>;
  }

  return <ProductCardInternal product={product} onProductSelect={onProductSelect} className={className} />;
}
