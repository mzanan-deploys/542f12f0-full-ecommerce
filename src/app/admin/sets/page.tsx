import React from 'react';
import Sets from '@/components/admin/sets/Sets';
import { fetchSetsData } from '@/components/admin/sets/useSets';
import { generateMetadata } from '@/lib/utils/seo';

export const metadata = generateMetadata({
  title: 'Sets',
  description: 'Manage product sets and collections.',
  noIndex: true,
});

export const dynamic = 'force-dynamic';

export default async function AdminSetsPage() {
  const initialSets = await fetchSetsData();
  return <Sets initialSets={initialSets} />;
} 