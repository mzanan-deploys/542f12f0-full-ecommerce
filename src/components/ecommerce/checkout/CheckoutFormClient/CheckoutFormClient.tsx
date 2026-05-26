'use client'

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '@/lib/schemas/checkoutSchemas';
import type { AddressFormValues } from '@/types/checkout';
import { AddressForm } from '@/components/ecommerce/checkout/AddressForm/AddressForm';
import { useDebounce } from '@/hooks/useDebounce';
import { useAppStore } from '@/components/providers/StoreProvider';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { StripeCardElementOptions } from '@stripe/stripe-js';
import { useStripePayment } from '@/hooks/useStripePayment';
import { Loader2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'checkoutAddress';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CheckoutFormContents = ({ onCountryChange, shippingPrice }: { onCountryChange?: (country: string) => void, shippingPrice?: number }) => {
    const methods = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            phone: '',
            email: ''
        }
    });

    const [isLoaded, setIsLoaded] = useState(false);
    const [validationWarning] = useState<string | null>(null);

    const isHydrated = useAppStore((state) => state._isHydrated);
    const cartItems = useAppStore((state) => state.cartItems);
    const getTotalPrice = useAppStore((state) => state.getCartTotalPrice);
    const clearCart = useAppStore((state) => state.clearCart);

    const watchedValues = methods.watch();

    const {
      isProcessing,
      paymentError,
      clientSecret,
      isWaitingForShipping,
      processPayment,
      stripe,
      elements,
    } = useStripePayment({
      cartItems,
      getTotalPrice,
      shippingPrice,
      watchedValues,
      isHydrated,
      clearCart,
    });


    useEffect(() => {
        if (typeof window !== 'undefined' && isHydrated) {
            try {
                const savedAddress = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (savedAddress) {
                    const parsedAddress = JSON.parse(savedAddress);
                    const validation = addressSchema.safeParse(parsedAddress);
                    if (validation.success) {
                        methods.reset(validation.data);
                    } else {
                        localStorage.removeItem(LOCAL_STORAGE_KEY);
                    }
                }
            } catch {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
            setIsLoaded(true);
        }
    }, [methods, isHydrated]);

    const debouncedValues = useDebounce(watchedValues, 500);

    useEffect(() => {
        if (isLoaded && isHydrated && typeof window !== 'undefined') {
            try {
                const validation = addressSchema.safeParse(debouncedValues);
                if (validation.success) {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(debouncedValues));
                }
            } catch (error) {
                console.error("Failed to save address to local storage:", error);
            }
        }
    }, [debouncedValues, isLoaded, isHydrated]);

    useEffect(() => {
        if (onCountryChange && watchedValues.country) {
            onCountryChange(watchedValues.country);
        }
    }, [watchedValues.country, onCountryChange]);

    const handleSubmit = async (addressData: AddressFormValues) => {
        await processPayment(addressData);
    };

    const cardElementOptions: StripeCardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#9e2146',
            },
        },
        hidePostalCode: true,
        iconStyle: 'default',
        disabled: false,
    };

    return (
        <FormProvider {...methods}>
            {!isHydrated || !isLoaded ? (
                <div className="space-y-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                            <p className="mt-2 text-gray-600">Loading form...</p>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
                    <div className="space-y-6">
                        <div>
                            <AddressForm 
                                cardElementOptions={cardElementOptions}
                                paymentError={paymentError}
                                validationWarning={validationWarning}
                                isProcessingPayment={isProcessing}
                                onProcessPayment={async (data: AddressFormValues) => await handleSubmit(data)}
                                isPlaceOrderDisabled={isProcessing || cartItems.length === 0 || !stripe || !elements || !clientSecret || isWaitingForShipping}
                                isWaitingForShipping={isWaitingForShipping}
                            />
                        </div>
                    </div>
                </form>
            )}
        </FormProvider>
    );
}

export default function CheckoutFormClient({ onCountryChange, shippingPrice }: { onCountryChange?: (country: string) => void, shippingPrice?: number }) {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutFormContents onCountryChange={onCountryChange} shippingPrice={shippingPrice} />
        </Elements>
    );
} 