'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatting';
import { useCart } from './useCart';
import { CartItem } from '@/components/ecommerce/cart/CartItem/CartItem';
import { EmptyCart } from '@/components/ecommerce/cart/EmptyCart/EmptyCart';
import type { CartItem as CartItemType } from '@/types/store';

export default function Cart() {
    const {
        cartItems,
        loadingItems,
        getCartTotalPrice,
        getMaxQuantityForItem,
        handleQuantityChange,
        handleRemoveItem
    } = useCart();

    if (cartItems.length === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-center mb-8">Your Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item: CartItemType) => (
                        <CartItem
                            key={item.variantId}
                            item={item}
                            maxQuantity={getMaxQuantityForItem(item)}
                            isLoading={loadingItems[item.variantId] || false}
                            onQuantityChange={handleQuantityChange}
                            onRemove={handleRemoveItem}
                        />
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <Card className="p-6 sticky top-24">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-2">
                            <span>Subtotal</span>
                            <span>{formatCurrency(getCartTotalPrice())}</span>
                        </div>
                        <div className="flex justify-between mb-4 text-gray-500">
                            <span>Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-4">
                            <span>Total</span>
                            <span>{formatCurrency(getCartTotalPrice())}</span>
                        </div>
                        <Button className="w-full mt-6" size="lg" asChild>
                            <Link href="/checkout">Proceed to Checkout</Link>
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
} 