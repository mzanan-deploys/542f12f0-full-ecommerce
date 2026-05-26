import { getAdminSetsList } from '@/lib/queries/setQueries.server';

export async function fetchSetsData() {
  try {
    const result = await getAdminSetsList();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to load sets');
    }
    
    return result.data?.sets || [];
  } catch (error) {
    console.error('Error fetching sets:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to load sets');
  }
} 