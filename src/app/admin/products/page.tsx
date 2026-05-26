import React, { Suspense } from 'react';
import dynamicImport from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle/AdminPageTitle';
import { DataTableSkeleton } from '@/components/admin/data-table/DataTable/DataTableSkeleton';
import { generateMetadata } from '@/lib/utils/seo';

export const metadata = generateMetadata({
  title: 'Products',
  description: 'Manage products and inventory.',
  noIndex: true,
});

export const dynamic = 'force-dynamic';

const ProductListClient = dynamicImport(
  () => import('@/components/admin/products/ProductListClient/ProductListClient').then(mod => ({ default: mod.ProductListClient })),
  { 
    loading: () => <DataTableSkeleton />
  }
);

export default function AdminProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
        <AdminPageTitle 
            title="Products" 
            description="Manage your products, including variants and images."
        >
            <Button asChild size="sm">
                <Link href="/admin/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Link>
            </Button>
        </AdminPageTitle>
        
        <Card>
            <CardContent className="pt-0">
                <Suspense fallback={<DataTableSkeleton />}>
                    <ProductListClient />
                </Suspense>
            </CardContent>
        </Card>
    </div>
  );
} 