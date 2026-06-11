import { cache } from 'react';
import { getSetPageBySlug } from '@/lib/queries/setQueries.server';
import { getSetting } from '@/lib/actions/settingsActions';

export const getSetPageCached = cache(getSetPageBySlug);

export async function fetchSetPageData(slug: string) {
    const [setResult, disclaimerResult] = await Promise.all([
        getSetPageCached(slug),
        getSetting('disclaimer_text')
    ]);

    if (!setResult.success || !setResult.data) {
        console.error(`Error fetching set page data for slug "${slug}":`, setResult.error);
        return null;
    }

    const set = setResult.data;
    const disclaimerText = disclaimerResult.success && disclaimerResult.data ? (disclaimerResult.data.value as string) : null;

    return { set, disclaimerText };
}
