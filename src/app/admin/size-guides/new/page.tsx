import React from 'react';
import SizeGuideTemplateForm from '@/components/admin/size-guides/SizeGuideTemplateForm/SizeGuideTemplateForm';

export const dynamic = 'force-dynamic';

export default function NewSizeGuidePage() {
  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Create New Size Guide Template</h1>
        <SizeGuideTemplateForm /> 
    </div>
  );
} 