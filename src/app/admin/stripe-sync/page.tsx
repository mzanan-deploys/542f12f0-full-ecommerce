import { Suspense } from 'react';
import StripeSyncPageClient from '@/components/admin/stripe/StripeSyncPageClient/StripeSyncPageClient';

export const dynamic = 'force-dynamic';

export default function StripeSyncPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Stripe Product Synchronization</h1>
        <p className="text-muted-foreground mt-2">
          Manage product synchronization between your database and Stripe
        </p>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <StripeSyncPageClient />
      </Suspense>
    </div>
  );
} 