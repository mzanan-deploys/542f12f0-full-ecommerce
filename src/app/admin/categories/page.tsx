import React from 'react';
import CategoriesClientPage from '@/components/admin/categories/CategoriesClientPage/CategoriesClientPage';
import { fetchCategoriesData } from '@/components/admin/categories/useCategories';
import { generateMetadata } from '@/lib/utils/seo';

export const dynamic = 'force-dynamic';

export const metadata = generateMetadata({
  title: 'Categories',
  description: 'Manage product categories and classifications.',
  noIndex: true,
});

export default async function CategoriesPage() {
  try {
    const initialCategories = await fetchCategoriesData();
    return (
      <div className="container mx-auto px-4 py-8">
        <CategoriesClientPage initialCategories={initialCategories} />
      </div>
    );
  } catch (error: any) {
    return <div className="p-6">{error.message}</div>;
  }
} 