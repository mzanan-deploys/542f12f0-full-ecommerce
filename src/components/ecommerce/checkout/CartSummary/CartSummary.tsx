'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from '@/components/providers/StoreProvider';
import { formatCurrency } from '@/lib/utils/formatting';

interface CartSummaryProps {
  isCheckout?: boolean;
  onProceedToPayment?: () => void;
  showProceedButton?: boolean;
  paymentLoading?: boolean;
  shippingPrice?: number;
}

export default function CartSummary({ 
  isCheckout = false, 
  shippingPrice
}: CartSummaryProps) {
  const cartItems = useAppStore((state) => state.cartItems);
  const getCartTotalPrice = useAppStore((state) => state.getCartTotalPrice);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getCartTotalPrice();
  const shipping = shippingPrice || 0;
  const total = subtotal + shipping;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({totalItems} items)
          </span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{isCheckout && shippingPrice !== undefined ? formatCurrency(shipping) : 'Calculated at checkout'}</span>
        </div>

        <Separator />

        <div className="flex justify-between font-medium text-base">
          <span>Total</span>
          <span>{isCheckout && shippingPrice !== undefined ? formatCurrency(total) : formatCurrency(subtotal)}</span>
        </div>

        {!isCheckout && (
          <div className="text-xs text-muted-foreground">
            Shipping and taxes calculated at checkout
          </div>
        )}

      </CardContent>
    </Card>
  );
} 