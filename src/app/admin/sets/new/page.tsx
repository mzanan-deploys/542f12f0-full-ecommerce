import React from 'react';
import { SetForm } from '@/components/ecommerce/sets/SetForm/SetForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle/AdminPageTitle';

export const dynamic = 'force-dynamic';

export default function NewSetPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminPageTitle title="Create New Set" backButtonHref="/admin/sets" />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Set Details</CardTitle>
          <CardDescription>Fill in the details for the new set.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <SetForm />
        </CardContent>
      </Card>
    </div>
  );
} 