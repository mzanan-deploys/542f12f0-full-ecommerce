'use client';

import React, { useEffect } from 'react';
import { SetForm } from '@/components/ecommerce/sets/SetForm/SetForm';
import ManageSetProducts from '@/components/ecommerce/sets/ManageSetProducts/ManageSetProducts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { SetRow, SetImageRow, ProductWithPosition } from '@/types/db';

interface SetEditContentProps {
    set: SetRow & { set_images: SetImageRow[] };
    setId: string;
    initialAssociatedProducts: ProductWithPosition[];
}

export default function SetEditContent({ set, setId, initialAssociatedProducts }: SetEditContentProps) {
    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash === '#manage-products') {
            const element = document.getElementById('manage-products-card');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, []);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Set Details</CardTitle>
                    <CardDescription>Update the details for this set.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <SetForm set={set} />
                </CardContent>
            </Card>

            <Card id="manage-products-card">
                <CardHeader>
                    <CardTitle>Manage Products</CardTitle>
                    <CardDescription>Add, remove, and reorder products within this set.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <ManageSetProducts
                        setId={setId}
                        initialAssociatedProducts={initialAssociatedProducts}
                    />
                </CardContent>
            </Card>
        </>
    );
} 