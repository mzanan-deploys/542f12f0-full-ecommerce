import React from 'react';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle/AdminPageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getSetsForSelection } from '@/lib/actions/setActions';
import EditProductFormLoader from '@/components/admin/products/EditProductFormLoader/EditProductFormLoader';
import { getProductByIdForEdit } from '@/lib/actions/productActions';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = await params;

    const productResult = await getProductByIdForEdit(productId);
    let pageTitle = "Edit Product";
    if (productResult.success && productResult.data) {
        pageTitle = `Edit Product: ${productResult.data.name}`;
    }

    const setsResult = await getSetsForSelection();
    const availableSets = setsResult.success && setsResult.data ? setsResult.data.sets : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <AdminPageTitle title={pageTitle} backButtonHref="/admin/products" />
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Edit Product Details</CardTitle>
                    <CardDescription>Modify the details for this product.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <EditProductFormLoader productId={productId} availableSets={availableSets} />
                </CardContent>
            </Card>
        </div>
    );
} 