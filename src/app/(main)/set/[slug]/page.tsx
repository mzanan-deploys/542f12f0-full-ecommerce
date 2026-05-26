import React from 'react';
import { notFound } from 'next/navigation';
import SetDisplay from '@/components/ecommerce/sets/SetDisplay/SetDisplay';
import DisclaimerBanner from '@/components/ecommerce/layout/DisclaimerBanner/DisclaimerBanner';
import { generateSetMetadata } from '@/lib/metadata/setMetadata';
import { fetchSetPageData } from '@/lib/helpers/setPageHelpers';

export const revalidate = 3600;
export const generateMetadata = generateSetMetadata;

export default async function SetPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const pageData = await fetchSetPageData(slug);

    if (!pageData) {
        notFound();
    }

    const { set, disclaimerText } = pageData;

    return (
        <>
            <DisclaimerBanner text={disclaimerText} />
            <SetDisplay set={set} />
        </>
    );
}
