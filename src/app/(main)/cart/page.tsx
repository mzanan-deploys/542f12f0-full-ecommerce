import React from 'react';
import Cart from '@/components/ecommerce/cart/Cart';
import { generateMetadata } from '@/lib/utils/seo';

export const revalidate = 1800;

export const metadata = generateMetadata({
  title: 'Shopping Cart',
  description: 'Review your selected items before checkout.',
  keywords: ['shopping cart', 'checkout'],
  canonicalUrl: '/cart',
});

export default function CartPage() {
    return <Cart />;
} 