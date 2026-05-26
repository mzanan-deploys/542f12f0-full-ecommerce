import React, { Suspense } from 'react';
import dynamicImport from 'next/dynamic';
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle/AdminPageTitle';

export const dynamic = 'force-dynamic';

const AboutForm = dynamicImport(
  () => import('@/components/admin/about/AboutForm/AboutForm'),
  {
    loading: () => (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
);

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminPageTitle 
        title="About Section" 
      />
      <Suspense fallback={
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      }>
        <AboutForm />
      </Suspense>
    </div>
  );
} 