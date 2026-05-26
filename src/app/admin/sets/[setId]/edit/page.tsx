import React from 'react';
import { getAdminSetById, getProductsInSetAction } from '@/lib/queries/setQueries.server';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import SetEditPageClientContent from '@/components/admin/sets/SetEditPageClientContent/SetEditPageClientContent'; 
import type { SetImageRow } from '@/types/db';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle/AdminPageTitle';

export const dynamic = 'force-dynamic';

export default async function EditSetPage({ params }: { params: Promise<{ setId: string }>}) {
    const { setId } = await params;
    
    const [setResult, associatedProductsResult] = await Promise.all([
        getAdminSetById(setId),
        getProductsInSetAction(setId),
    ]);

    const fetchedSetData = setResult.success ? setResult.data : null;
    const associatedProducts = associatedProductsResult.success ? (associatedProductsResult.data?.products ?? []) : [];

    if (!setResult.success || !fetchedSetData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <AdminPageTitle title="Edit Set" backButtonHref="/admin/sets" />
                <Alert variant="destructive" className="mt-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{setResult.error || 'Set not found'}</AlertDescription>
                </Alert>
            </div>
        );
    }

    const setForClient = {
        ...fetchedSetData,
        set_images: (fetchedSetData.set_images || []) as unknown as SetImageRow[],
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <AdminPageTitle title={`Edit Set: ${fetchedSetData.name}`} backButtonHref="/admin/sets" />

            <SetEditPageClientContent 
                set={setForClient} 
                setId={setId} 
                initialAssociatedProducts={associatedProducts} 
            />
        </div>
    );
} 