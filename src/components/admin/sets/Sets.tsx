import React, { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle/AdminPageTitle';
import SetListClient from '@/components/admin/sets/SetListClient/SetListClient';
import { DataTableSkeleton } from '@/components/admin/data-table/DataTable/DataTableSkeleton';
import type { AdminSetListItem } from '@/types/sets';

interface SetsProps {
  initialSets: AdminSetListItem[];
}

export default function Sets({ initialSets }: SetsProps) {
  return (
    <div className="container mx-auto px-4 py-8">
       <AdminPageTitle 
          title="Sets"
          description="Manage your sets and assign products."
      >
          <Button asChild size="sm">
              <Link href="/admin/sets/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Set
              </Link>
          </Button>
      </AdminPageTitle>
      
      <Card>
          <CardContent className="pt-0">
              <Suspense fallback={<DataTableSkeleton />}>
                  <SetListClient initialSets={initialSets} />
              </Suspense>
          </CardContent>
      </Card>
    </div>
  );
} 