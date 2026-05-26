'use server';

import Stripe from 'stripe';
import type { CreatePaymentIntentResponse, OrderItemDetail, StripeValidationResult } from '@/types/stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil' as any,
});

export async function createPaymentIntent(
  amountInCents: number,
  receiptEmail: string,
  metadata?: Stripe.MetadataParam
): Promise<CreatePaymentIntentResponse> {
  if (amountInCents <= 0) {
    return { error: 'Invalid amount for payment intent.' };
  }

  try {
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: metadata,
    };

    if (receiptEmail && receiptEmail.trim() !== '') {
      paymentIntentParams.receipt_email = receiptEmail;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return { clientSecret: paymentIntent.client_secret ?? undefined };
  } catch (error: any) {
    console.error('Error creating payment intent:', error.message);
    return { error: error.message || 'Failed to create payment intent.' };
  }
}

export async function createPaymentIntentWithStripeProducts(
  items: OrderItemDetail[],
  shippingPrice: number = 0,
  receiptEmail: string,
  metadata?: Stripe.MetadataParam
): Promise<CreatePaymentIntentResponse> {
  try {
    let totalAmount = 0;

    for (const item of items) {
      const prices = await stripe.prices.search({
        query: `metadata["variant_id"]:"${item.variantId}" AND active:"true"`,
        limit: 1,
      });

      if (prices.data.length === 0) {
        console.warn(`No active Stripe price found for variant ${item.variantId}, using fallback price`);
        totalAmount += item.priceAtPurchase * item.quantity * 100;
      } else {
        const stripePrice = prices.data[0];
        totalAmount += (stripePrice.unit_amount || 0) * item.quantity;
      }
    }

    totalAmount += Math.round(shippingPrice * 100);

    if (totalAmount <= 0) {
      return { error: 'Invalid amount for payment intent.' };
    }

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: totalAmount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        ...metadata,
        shipping_price: shippingPrice.toString(),
        items_count: items.length.toString(),
      },
    };

    if (receiptEmail && receiptEmail.trim() !== '') {
      paymentIntentParams.receipt_email = receiptEmail;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return { clientSecret: paymentIntent.client_secret ?? undefined };
  } catch (error: any) {
    console.error('Error creating payment intent with Stripe products:', error.message);
    return { error: error.message || 'Failed to create payment intent.' };
  }
}

export async function validateCartItemsInStripe(items: OrderItemDetail[]): Promise<StripeValidationResult> {
  const missingSyncItems: string[] = [];
  const errors: string[] = [];

  for (const item of items) {
    try {
      const prices = await stripe.prices.search({
        query: `metadata["variant_id"]:"${item.variantId}" AND active:"true"`,
        limit: 1,
      });

      if (prices.data.length === 0) {
        missingSyncItems.push(`${item.name || 'Unknown Product'} (${item.size || 'No size'})`);
      }
    } catch (error: any) {
      errors.push(`Error checking ${item.name || 'Unknown Product'}: ${error.message}`);
    }
  }

  return {
    isValid: missingSyncItems.length === 0 && errors.length === 0,
    missingSyncItems,
    errors,
  };
} 