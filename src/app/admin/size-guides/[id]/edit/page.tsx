import React from 'react';
import SizeGuideTemplateForm from '@/components/admin/size-guides/SizeGuideTemplateForm/SizeGuideTemplateForm';
import { getSizeGuideTemplateById } from '@/lib/actions/sizeGuideActions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import type { SizeGuideTemplate } from '@/lib/schemas/sizeGuideTemplateSchema';

export const dynamic = 'force-dynamic';

export default async function EditSizeGuidePage({params }: { params: Promise<{ id: string }> }) {
    const { id: templateId } = await params; 
    
    const result = await getSizeGuideTemplateById(templateId);

    if (!result.success || !result.data) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {result.message || 'Could not load size guide template.'}
                </AlertDescription>
            </Alert>
        );
    }

    const template: SizeGuideTemplate = {
        id: result.data.id,
        name: result.data.name,
        guide_data: result.data.guide_data as unknown,
        created_at: result.data.created_at,
        updated_at: result.data.updated_at,
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Edit Size Guide Template</h1>
             <SizeGuideTemplateForm initialData={template} /> 
        </div>
  );
} 