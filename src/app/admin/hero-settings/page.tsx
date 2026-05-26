import React, { Suspense } from 'react';
import dynamicImport from 'next/dynamic';
import { getHeroContent } from '@/lib/queries/heroQueries.server';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle/AdminPageTitle';

export const dynamic = 'force-dynamic';

const HeroSettingsForm = dynamicImport(
  () => import('@/components/admin/hero/HeroSettingsForm/HeroSettingsForm'),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
);

export default async function HeroSettingsPage() {
  let initialData = null;
  try {
    initialData = await getHeroContent();
  } catch (error) {
    console.error('Failed to fetch hero content:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminPageTitle 
        title="Hero Media" 
        description="Set a Hero media (image or video)"
      />
      <Card>
        <CardContent>
          <Suspense fallback={
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          }>
            <HeroSettingsForm initialData={initialData} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
} 