import React from 'react';
import { getProductBySlugAction } from '@/lib/actions/productActions';
import { notFound } from 'next/navigation';
import ProductDetailsClient from '@/components/ecommerce/products/ProductDetailsClient/ProductDetailsClient';

export const revalidate = 3600;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params; 
  const productResult = await getProductBySlugAction({ slug: resolvedParams.slug });

  if (!productResult.success) {
    if (productResult.error === 'Product not found') {
        notFound();
    } else {
        console.error("Critical error fetching product:", productResult.error);
        throw new Error(productResult.error || "Failed to load product details"); 
    }
  }
  if (!productResult.data) {
    console.error("Product fetch succeeded but no data returned for slug:", resolvedParams.slug);
    notFound();
  }
  
  const product = productResult.data;

  return (
    <div className="container mx-auto px-4 py-8">
       <ProductDetailsClient 
          product={product} 
          variants={product.product_variants} 
       />
    </div>
  );
}
