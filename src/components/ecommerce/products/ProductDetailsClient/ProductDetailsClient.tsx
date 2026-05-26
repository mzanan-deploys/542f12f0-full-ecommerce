'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Minus, Plus } from 'lucide-react';
import { useProductCard } from '@/components/ecommerce/products/ProductCard/useProductCard';
import type { ProductPageData } from '@/types/product';
import { AddToCartButton } from '@/components/ecommerce/products/AddToCartButton/AddToCartButton';
import { cn } from '@/lib/utils/cn';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

interface ProductDetailsClientProps {
  product: ProductPageData;
  variants: ProductPageData['product_variants'];
}

export default function ProductDetailsClient({ product, variants: _variants }: ProductDetailsClientProps) {
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
  } = useProductCard(product as Parameters<typeof useProductCard>[0]);

  const [isClient, setIsClient] = useState(false);

  useScrollRestoration({ 
    key: `productScrollPos-${product.slug}`,
    smoothRestore: false
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="aspect-square bg-muted rounded-xl animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse"></div>
          <div className="h-6 bg-muted rounded animate-pulse w-1/3"></div>
          <div className="h-20 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Product Images */}
      <div className="space-y-4">
        <Card className="p-0">
          <CardHeader className="p-0">
            <Carousel setApi={setApi} opts={{ loop: displayImages.length > 1 }}>
              <CarouselContent>
                {displayImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-square">
                      <Image
                        src={image.image_url || "/placeholder-image.png"}
                        alt={image.alt_text || `${product.name} image ${index + 1}`}
                        fill
                        className="object-cover rounded-xl"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {slideCount > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          </CardHeader>
        </Card>

        {/* Thumbnail navigation */}
        {slideCount > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "relative w-16 h-16 rounded-md overflow-hidden border-2 transition-colors flex-shrink-0",
                  currentSlide === index ? "border-primary" : "border-transparent"
                )}
              >
                <Image
                  src={image.image_url || "/placeholder-image.png"}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary">{formattedPrice}</p>
        </div>

        {product.description && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
        )}

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
          <>
            {/* Size Selection */}
            {availableVariants.length > 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Size:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableVariants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariantId === variant.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedVariantId(variant.id)}
                      disabled={!variant.isAvailable}
                      className="min-w-12"
                    >
                      {variant.size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Information */}
            <div className="space-y-2">
              <span className="text-sm font-medium">
                Stock: {selectedVariantStock > 0 ? `${selectedVariantStock} available` : 'Out of stock'}
              </span>
              {selectedVariantStock <= 5 && selectedVariantStock > 0 && (
                <p className="text-sm text-amber-600">Only {selectedVariantStock} left in stock!</p>
              )}
            </div>

            {/* Quantity Selection */}
            <div className="space-y-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="h-9 w-9"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-medium  bg-muted rounded-lg min-w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= selectedVariantStock}
                  className="h-9 w-9"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <AddToCartButton
              variantId={selectedVariantId || ''}
              productName={product.name}
              productPrice={typeof product.price === 'string' ? parseFloat(product.price) : product.price}
              productImageUrl={product.product_images?.[0]?.image_url}
              availableStock={selectedVariantStock}
              disabled={selectedVariantStock <= 0}
            />
          </>
        )}
      </div>
    </div>
  );
} 