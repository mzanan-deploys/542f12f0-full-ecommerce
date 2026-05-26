import type { AddressFormValues } from '@/types/checkout';

export interface OrderItemDetail {
  variantId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number; 
  size: string | null;
  name?: string;
}

export interface SaveOrderParams {
  shippingAddress: AddressFormValues;
  items: OrderItemDetail[];
  totalAmount: number; 
  paymentIntentId: string;
  shippingPrice?: number;
}

export interface SaveOrderResponse {
  orderId?: string;
  error?: string;
  userEmail?: string;
} 