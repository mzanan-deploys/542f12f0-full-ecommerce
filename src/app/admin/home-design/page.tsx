import React, { Suspense } from 'react';
import dynamicImport from 'next/dynamic';
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle/AdminPageTitle';

export const dynamic = 'force-dynamic';

const HomeDesign = dynamicImport(
  () => import('@/components/admin/home-design/HomeDesign'),
  {
    loading: () => (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
);

export default function HomeDesignPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminPageTitle 
        title="Homepage Layout" 
        description="Design and manage your homepage layout and content order"
      />
      <Suspense fallback={
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <HomeDesign />
      </Suspense>
    </div>
  );
}