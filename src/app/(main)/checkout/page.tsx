import React from 'react';
import Checkout from '@/components/ecommerce/checkout/Checkout';
import { generateMetadata } from '@/lib/utils/seo';

export const revalidate = 900;

export const metadata = generateMetadata({
  title: 'Checkout',
  description: 'Complete your purchase with secure payment.',
  keywords: ['checkout', 'payment', 'secure purchase'],
  canonicalUrl: '/checkout',
  noIndex: true,
});

export default function CheckoutPage() {
    return <Checkout />;
} 