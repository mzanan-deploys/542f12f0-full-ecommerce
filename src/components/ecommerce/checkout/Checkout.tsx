'use client';

import React from 'react';
import { useCheckout } from './useCheckout';
import CheckoutFormClient from '@/components/ecommerce/checkout/CheckoutFormClient/CheckoutFormClient';
import CartSummary from '@/components/ecommerce/checkout/CartSummary/CartSummary';
import { EmptyCart } from '@/components/ecommerce/cart/EmptyCart/EmptyCart';
import { Loader2 } from 'lucide-react';

export default function Checkout() {
    const {
        selectedCountry: _selectedCountry,
        setSelectedCountry,
        shippingPrice,
        isHydrated,
        totalItems
    } = useCheckout();

    if (!isHydrated) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-md mx-auto text-center">
                        <div className="mb-6">
                            <Loader2 className="mx-auto h-16 w-16 text-gray-400 animate-spin" />
                        </div>
                        <p className="text-gray-600">Loading checkout...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (totalItems === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="container mx-auto px-6 py-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8 lg:items-start">
                <div>
                    <CheckoutFormClient 
                        onCountryChange={setSelectedCountry} 
                        shippingPrice={shippingPrice}
                    />
                </div>

                 <div className="lg:sticky lg:top-24 lg:mt-[3rem] h-fit"> 
                     <CartSummary 
                        isCheckout={true}
                        shippingPrice={shippingPrice}
                     />
                 </div>
            </div>
        </div>
    );
} 