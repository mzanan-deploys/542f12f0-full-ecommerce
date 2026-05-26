import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';
import type { CartItem as CartItemType } from '@/types/store';

interface CartItemProps {
    item: CartItemType;
    maxQuantity: number;
    isLoading: boolean;
    onQuantityChange: (variantId: string, newQuantity: number) => void;
    onRemove: (variantId: string) => void;
}

export function CartItem({ item, maxQuantity, isLoading, onQuantityChange, onRemove }: CartItemProps) {
    const imageUrl = item.imageUrl;

    return (
        <div className="flex gap-2 md:gap-3 border-b pb-4 last:border-b-0">
            {/* Image */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded bg-muted">
                {imageUrl ? (
                    <Image 
                        src={imageUrl} 
                        alt={item.name ?? 'Product'} 
                        fill
                        sizes="(max-width: 640px) 64px, 80px"
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs"></div>
                )}
            </div>

            {/* InfoAndActionsContainer: Grid on mobile, Flex on desktop */}
            <div className="flex-grow min-w-0 grid grid-cols-[1fr_auto_auto] grid-rows-[auto_auto] gap-x-2 items-start 
                            md:flex md:flex-row md:items-center md:gap-3 md:grid-cols-none md:grid-rows-none">
                
                {/* Product Details (Name/Size) */}
                <div className="col-start-1 row-start-1 row-span-2 
                                md:col-auto md:row-span-1 md:order-1 md:flex-grow md:min-w-0">
                    <Link href={item.slug ? `/product/${item.slug}` : '#'} className="font-medium hover:text-primary transition-colors line-clamp-2">
                        {item.name ?? 'Product Name'}
                    </Link>
                    {item.size && (
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">Size: {item.size}</p>
                    )}
                </div>

                {/* Quantity Selector */}
                <div className="col-start-2 row-start-1 flex items-center gap-1 justify-start 
                                md:col-auto md:row-auto md:order-2 md:w-28 md:flex-shrink-0">
                    <Button 
                        variant="outline" size="icon" className="h-7 w-7 md:h-8 md:w-8" 
                        onClick={() => onQuantityChange(item.variantId, item.quantity - 1)}
                        disabled={isLoading || item.quantity <= 0}
                    >
                        {isLoading && (item.quantity -1) >=0 ? <Loader2 className="h-4 w-4 animate-spin" /> : '-'}
                    </Button>
                    <div className="h-7 w-9 md:h-8 md:w-10 text-center p-0 border border-input rounded-md flex items-center justify-center text-sm bg-background">
                        {item.quantity}
                    </div>
                    <Button 
                        variant="outline" size="icon" className="h-7 w-7 md:h-8 md:w-8" 
                        onClick={() => onQuantityChange(item.variantId, item.quantity + 1)}
                        disabled={isLoading || item.quantity >= maxQuantity}
                        title={item.quantity >= maxQuantity ? `Maximum stock available: ${maxQuantity}` : ''}
                    >
                        {isLoading && (item.quantity + 1) <= maxQuantity ? <Loader2 className="h-4 w-4 animate-spin" /> : '+'}
                    </Button>
                </div>

                {/* Price Text */}
                <div className="col-start-2 row-start-2 font-medium pt-1 
                                md:col-auto md:row-auto md:order-3 md:min-w-[5rem] text-right md:pt-0">
                    {formatCurrency((item.price ?? 0) * item.quantity)}
                </div>
                
                {/* Remove Button */}
                <div className="col-start-3 row-start-1 row-span-2 flex items-center 
                                md:col-auto md:row-span-1 md:order-4 md:flex-shrink-0">
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-600" onClick={() => onRemove(item.variantId)} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
} 