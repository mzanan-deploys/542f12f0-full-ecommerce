'use client'; 

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle/AdminPageTitle';
import { SizeGuideListClient } from '@/components/admin/size-guides/SizeGuides/SizeGuideListClient';
import { DataTableSkeleton } from '@/components/admin/data-table/DataTable/DataTableSkeleton';

export default function SizeGuidesPage() {
    return (
        <div className="container mx-auto px-4 py-8">
             <AdminPageTitle 
                title="Size Guide Templates"
                description="Create and manage reusable size guide templates for your products."
            >
                <Button asChild size="sm">
                    <Link href="/admin/size-guides/new">
                        <Plus className="mr-2 h-4 w-4" /> Create New Template
                    </Link>
                 </Button>
            </AdminPageTitle>
            
            <Card>
                 <CardContent className="pt-0">
                    <Suspense fallback={<DataTableSkeleton />}>
                        <SizeGuideListClient /> 
                    </Suspense>
                 </CardContent>
            </Card>
        </div>
    );
} 