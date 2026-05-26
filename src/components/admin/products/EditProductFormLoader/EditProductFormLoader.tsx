'use client';

import React from 'react';
import { ProductForm } from '@/components/admin/products/ProductForm/ProductForm';
import { useProductByIdForEdit } from '@/lib/queries/productQueries.client';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface SetOptionForForm {
    label: string;
    value: string;
    group?: string | undefined;
}

interface EditProductFormLoaderProps {
  productId: string;
  availableSets: SetOptionForForm[] | undefined;
}

export default function EditProductFormLoader({ productId, availableSets }: EditProductFormLoaderProps) {
  const { data: productResult, isLoading, isError } = useProductByIdForEdit(productId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="mr-3 h-8 w-8 animate-spin text-primary" />
        <p className="text-lg">Loading product details...</p>
      </div>
    );
  }

  if (isError || !productResult?.success || !productResult?.data) {
    return (
      <div className="mt-8 flex items-center justify-center rounded border border-destructive bg-destructive/10 p-6 text-destructive">
        <AlertTriangle className="mr-3 h-6 w-6" />
        <p className="font-medium">Failed to load product data. It might have been deleted or an error occurred.</p>
      </div>
    );
  }

  return <ProductForm initialData={productResult.data} availableSets={availableSets} />;
} 