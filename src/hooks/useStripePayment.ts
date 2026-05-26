import { useState, useEffect, useCallback } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  createPaymentIntent, 
  createPaymentIntentWithStripeProducts,
  validateCartItemsInStripe,
  saveOrderAction 
} from '@/lib/actions/stripeActions';
import type { AddressFormValues } from '@/types/checkout';
import type { CartItem } from '@/types/store';

interface UseStripePaymentProps {
  cartItems: CartItem[];
  getTotalPrice: () => number;
  shippingPrice?: number;
  watchedValues: AddressFormValues;
  isHydrated: boolean;
  clearCart: () => void;
}

export function useStripePayment({
  cartItems,
  getTotalPrice,
  shippingPrice,
  watchedValues,
  isHydrated,
  clearCart,
}: UseStripePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentInitialized, setPaymentIntentInitialized] = useState(false);
  const [isWaitingForShipping, setIsWaitingForShipping] = useState(false);

  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const getTotalWithShipping = useCallback(() => {
    const subtotal = getTotalPrice();
    const shipping = shippingPrice || 0;
    return subtotal + shipping;
  }, [getTotalPrice, shippingPrice]);

  const initializePaymentIntent = useCallback(async () => {
    const currentEmail = watchedValues.email;
    const totalWithShipping = getTotalWithShipping();
    
    if (paymentIntentInitialized) return;
    
    if (watchedValues.country && (shippingPrice === undefined || shippingPrice === null)) {
      console.warn('[CHECKOUT] Shipping price not loaded yet for country:', watchedValues.country);
      return;
    }
    
    if (cartItems.length === 0 || totalWithShipping <= 0) {
      console.warn('[CHECKOUT] Cannot initialize payment: invalid cart or total');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const orderItems = cartItems.map(item => ({
        variantId: item.variantId,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price || 0,
        size: item.size,
        name: item.name
      }));

      const validation = await validateCartItemsInStripe(orderItems);
      const amountInCents = Math.round(totalWithShipping * 100);
      
      const response = validation.isValid
        ? await createPaymentIntentWithStripeProducts(
            orderItems,
            shippingPrice || 0,
            currentEmail || "",
            {
              payment_method: 'stripe_products',
              country: watchedValues.country || 'unknown'
            }
          )
        : await createPaymentIntent(amountInCents, currentEmail || "", {
            shipping_price: (shippingPrice || 0).toString(),
            payment_method: 'traditional_fallback',
            country: watchedValues.country || 'unknown'
          });
      
      if (response.clientSecret) {
        setClientSecret(response.clientSecret);
        setPaymentIntentInitialized(true);
        setPaymentError(null);
      } else {
        throw new Error(response.error || "Failed to initialize payment.");
      }
    } catch (error: any) {
      console.error('[CHECKOUT] Error initializing payment intent:', error);
      setPaymentError(`Payment initialization failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [
    watchedValues.email,
    watchedValues.country,
    cartItems,
    getTotalWithShipping,
    shippingPrice,
    paymentIntentInitialized
  ]);

  useEffect(() => {
    const isWaitingShipping = Boolean(watchedValues.country && shippingPrice === undefined);
    setIsWaitingForShipping(isWaitingShipping);
    
    if (watchedValues.country) {
      setPaymentError(null);
    }
    
    const isValidEmail = watchedValues.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedValues.email);
    
    const shouldInitialize = (
      isHydrated &&
      isValidEmail && 
      cartItems.length > 0 &&
      (!watchedValues.country || (watchedValues.country && shippingPrice !== undefined))
    );
    
    if (shouldInitialize && !paymentIntentInitialized) {
      initializePaymentIntent();
    }
  }, [
    watchedValues.email,
    watchedValues.country,
    cartItems.length,
    paymentIntentInitialized,
    shippingPrice,
    isHydrated,
    initializePaymentIntent
  ]);

  const processPayment = useCallback(async (addressData: AddressFormValues) => {
    if (!stripe || !elements || !clientSecret) {
      setPaymentError(
        !clientSecret ? "Payment session not initialized. Please wait or refresh." :
        "Stripe.js has not loaded yet. Please wait."
      );
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError("Card details not found. Please ensure card information is entered correctly.");
      return;
    }

    if (cartItems.length === 0) {
      setPaymentError("Your cart is empty.");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: addressData.name,
            address: {
              line1: addressData.address1,
              line2: addressData.address2 || undefined,
              city: addressData.city,
              state: addressData.state,
              postal_code: addressData.postalCode,
              country: addressData.country,
            },
            phone: addressData.phone || undefined,
          },
        },
      });

      if (error) {
        setPaymentError(error.message || "An unexpected payment error occurred.");
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const orderItems = cartItems.map(item => ({
          variantId: item.variantId,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.price || 0,
          size: item.size,
          name: item.name
        }));

        const saveResponse = await saveOrderAction({
          shippingAddress: addressData,
          items: orderItems,
          totalAmount: getTotalWithShipping(),
          paymentIntentId: paymentIntent.id,
          shippingPrice: shippingPrice || 0,
        });

        if (saveResponse.orderId) {
          toast.success("Payment successful!");
          clearCart();
          router.push(`/checkout/success?order_id=${saveResponse.orderId}&pi_id=${paymentIntent.id}`);
        } else {
          toast.error(saveResponse.error || "Payment succeeded but failed to save order. Please contact support.");
        }
      } else {
        setPaymentError("Payment did not succeed. Status: " + paymentIntent?.status);
      }
    } catch (generalError: any) {
      console.error('Payment processing error:', generalError);
      setPaymentError("An unexpected error occurred while processing payment.");
    } finally {
      setIsProcessing(false);
    }
  }, [stripe, elements, clientSecret, cartItems, getTotalWithShipping, shippingPrice, clearCart, router]);

  return {
    isProcessing,
    paymentError,
    clientSecret,
    isWaitingForShipping,
    processPayment,
    stripe,
    elements,
  };
}



