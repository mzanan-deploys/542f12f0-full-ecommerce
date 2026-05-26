import { getSetPageBySlug } from '@/lib/queries/setQueries.server';
import { getSetting } from '@/lib/actions/settingsActions';

export async function fetchSetPageData(slug: string) {
    const [setResult, disclaimerResult] = await Promise.all([
        getSetPageBySlug(slug),
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

export async function fetchSetPageDataOld(slug: string) {
    const [result, disclaimerResult] = await Promise.all([
        getSetPageBySlug(slug),
        getSetting('disclaimer_text')
    ]);

    if (!result.success || !result.data) {
        return null;
    }

    const set = result.data;
    const disclaimerText = disclaimerResult.success && disclaimerResult.data ? disclaimerResult.data.value : null;

    return { set, disclaimerText };
} 