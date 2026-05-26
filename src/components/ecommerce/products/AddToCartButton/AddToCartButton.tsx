'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';
import { useAddToCart } from '@/lib/queries/cartQueries';

interface AddToCartButtonProps {
  variantId: string;
  productName: string;
  productPrice: number;
  productImageUrl?: string | null;
  availableStock: number;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  showPrice?: boolean;
  disabled?: boolean;
  quantity?: number;
}

export function AddToCartButton({
  variantId,
  productName,
  productPrice,
  productImageUrl,
  availableStock,
  className = '',
  size = 'default',
  variant = 'default',
  showPrice = false,
  disabled = false,
  quantity = 1,
}: AddToCartButtonProps) {
  const addToCartMutation = useAddToCart();

  const isOutOfStock = availableStock === 0;
  const isDisabled = disabled || isOutOfStock || addToCartMutation.isPending || quantity > availableStock;

  const handleAddToCart = async () => {
    if (isDisabled) return;

    try {
      await addToCartMutation.mutateAsync({
        variantId,
        quantity,
        productName,
        productPrice,
        productImageUrl,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (isOutOfStock) {
    return (
      <Button disabled className={className} size={size} variant="outline">
        Out of Stock
      </Button>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showPrice && (
        <div className="text-lg font-semibold">
          {formatCurrency(productPrice)}
        </div>
      )}
      
      <Button
        onClick={handleAddToCart}
        disabled={isDisabled}
        size={size}
        variant={variant}
        className="w-full"
      >
        {addToCartMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="mr-2 h-4 w-4" />
        )}
        Add to Cart
      </Button>
    </div>
  );
} 