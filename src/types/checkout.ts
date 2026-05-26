import { z } from 'zod';
import { addressSchema } from '@/lib/schemas/checkoutSchemas';
import type { CartItem } from './cart';
import type { ActionResponse } from './actions';

export type AddressFormValues = z.infer<typeof addressSchema>;

export interface CreateCheckoutSessionArgs {
    items: CartItem[];
    shippingAddress: AddressFormValues;
    billingAddress?: AddressFormValues | null;
    userId?: string | null; 
    email?: string | null; 
}

export interface CheckoutActionResponse extends ActionResponse<{ sessionId: string } | null> {}

export interface ConfirmationViewProps {
  data: AddressFormValues;
  setCurrentStep: (step: number) => void;
}

export interface PaymentViewProps {
  setCurrentStep: (step: number) => void;
  cardElementOptions: any;
  paymentError: string | null;
  validationWarning?: string | null;
  isProcessingPayment: boolean;
  onProcessPayment: () => void;
  isPlaceOrderDisabled: boolean;
  isWaitingForShipping?: boolean;
}

export interface CheckoutFormClientProps {
  onCountryChange?: (country: string) => void;
  shippingPrice?: number;
}

export interface CheckoutFormContentsProps {
  onCountryChange?: (country: string) => void;
  shippingPrice?: number;
} 