import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCacheStore } from '@/store/cacheStore';
import { syncHomepageLayout } from '@/lib/actions/layoutActions';
import { getHomepageLayoutDataAction, createPageComponentAction } from './homeDesignQueries.server';
import { PageComponentContent, PageComponent, SetRow } from '@/types/db'; 
import type {
    CreatePageComponentArgs,
    LayoutUpdateItemArgs,
    DeleteHomepageItemArgs,
    UpdatePageComponentContentArgs,
    UpdateSetContentArgs
} from '@/types/homeDesign';
import { 
    updateHomepageLayoutOrder as updateHomepageLayoutOrderAction,
    deleteHomepageItem as deleteHomepageItemAction,
} from '@/lib/actions/layoutActions';
import {
    updatePageComponent as updatePageComponentAction,
} from '@/lib/actions/pageComponentActions';
import { updateSet as updateSetAction } from '@/lib/actions/sets/setProductActions.client';
import { toast } from 'sonner';

export const homeLayoutQueryKeys = {
    all: ['homeLayout'] as const,
    layout: (pagePath: string) => [...homeLayoutQueryKeys.all, pagePath] as const,
};

async function fetchHomepageLayoutData(pagePath: string) {
    const result = await getHomepageLayoutDataAction(pagePath);
    
    if (!result.success || !result.data) {
        console.error('[Client] fetchHomepageLayoutData: Failed to fetch data from server action.', result.error);
        throw new Error(result.error || 'Failed to fetch homepage layout data.');
    }
    
    return result.data;
}

async function syncLayoutData(pagePath: string) {
    try {
        const result = await syncHomepageLayout(pagePath);
        return result;
    } catch (error) {
        console.error('[ERROR] syncLayoutData failed:', error);
        throw error;
    }
}

export function useHomeLayoutData(pagePath: string = '/') {
    const cache = useCacheStore();
    const cacheKey = `home-layout-${pagePath}`;
    
    const query = useQuery({
        queryKey: homeLayoutQueryKeys.layout(pagePath),
        queryFn: async () => {
            const cached = cache.get(cacheKey);
            if (cached) return cached;
            
            const data = await fetchHomepageLayoutData(pagePath);
            cache.set(cacheKey, data, 2 * 60 * 1000);
            return data;
        },
        retry: (failureCount) => {
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
    
    return query;
}

export function useLayoutSync(pagePath: string = '/') {
    const cache = useCacheStore();
    const cacheKey = `layout-sync-${pagePath}`;
    
    const query = useQuery({
        queryKey: [...homeLayoutQueryKeys.all, 'sync', pagePath],
        queryFn: async () => {
            const cached = cache.get(cacheKey);
            if (cached) return cached;
            
            const data = await Promise.race([
                syncLayoutData(pagePath),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Sync timeout after 10 seconds')), 10000)
                )
            ]);
            cache.set(cacheKey, data, 1 * 60 * 1000);
            return data;
        },
        staleTime: 1000 * 60,
        retry: 1,
        retryDelay: 2000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });
    
    return query;
}

async function createPageComponent(args: CreatePageComponentArgs): Promise<PageComponent> {
    const result = await createPageComponentAction(args);

    if (!result.success || !result.data) {
        console.error('[Client] createPageComponent: Server action failed.', result.error);
        throw new Error(result.error || 'Failed to create page component.');
    }

    return result.data;
}

export function useCreatePageComponentMutation() {
    const cache = useCacheStore();
    
    return useMutation<PageComponent, Error, CreatePageComponentArgs>({
        mutationFn: createPageComponent,
        onSuccess: () => {
            toast.success('Page component created successfully.');
            Object.keys(cache.cache).forEach(key => {
                if (key.includes('home-layout') || key.includes('layout-sync')) {
                    cache.remove(key);
                }
            });
        },
        onError: (error) => {
            toast.error(`Failed to create component: ${error.message}`);
        },
    });
}

async function updateHomepageLayoutOrder(items: LayoutUpdateItemArgs[]): Promise<void> {
    if (items.length === 0) return;
    const result = await updateHomepageLayoutOrderAction(items);
    if (!result.success) {
        throw new Error(result.message || 'Failed to update layout order.');
    }
}

export function useUpdateHomepageLayoutOrderMutation() {
    const queryClient = useQueryClient();
    const cache = useCacheStore();
    
    return useMutation<void, Error, LayoutUpdateItemArgs[]>({
        mutationFn: updateHomepageLayoutOrder,
        onSuccess: (_, variables) => {
            toast.success('Homepage layout order updated.');
            const pagePath = variables.length > 0 ? variables[0].page_path : '/';
            queryClient.invalidateQueries({ queryKey: homeLayoutQueryKeys.layout(pagePath) });
            Object.keys(cache.cache).forEach(key => {
                if (key.includes('home-layout') || key.includes('layout-sync')) {
                    cache.remove(key);
                }
            });
        },
        onError: (error) => {
            toast.error(`Failed to update layout: ${error.message}`);
        }
    });
}

async function deleteHomepageItem(args: DeleteHomepageItemArgs): Promise<void> {
    const { itemId, itemType } = args;
    const result = await deleteHomepageItemAction(itemId, itemType);
    if (!result.success) {
        throw new Error(result.message || 'Failed to delete item.');
    }
}

export function useDeleteHomepageItemMutation() {
    const cache = useCacheStore();
    
    return useMutation<void, Error, DeleteHomepageItemArgs>({
        mutationFn: deleteHomepageItem,
        onSuccess: () => {
            toast.success('Item deleted successfully from layout.');
            Object.keys(cache.cache).forEach(key => {
                if (key.includes('home-layout') || key.includes('layout-sync')) {
                    cache.remove(key);
                }
            });
        },
        onError: (error) => {
            toast.error(`Failed to delete item: ${error.message}`);
        }
    });
}

async function updatePageComponentContent(args: UpdatePageComponentContentArgs): Promise<PageComponent> {
    const { id, content, affiliation } = args;
    const updates: { content?: Partial<PageComponentContent>; affiliation?: string } = {};
    if (content) updates.content = content;
    if (affiliation) updates.affiliation = affiliation;
    
    const result = await updatePageComponentAction(id, updates); 
    if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to update page component content.');
    }
    return result.data as PageComponent;
}

export function useUpdatePageComponentContentMutation() {
    const cache = useCacheStore();
    
    return useMutation<PageComponent, Error, UpdatePageComponentContentArgs>({
        mutationFn: updatePageComponentContent,
        onSuccess: () => {
            toast.success('Page component content updated.');
            Object.keys(cache.cache).forEach(key => {
                if (key.includes('home-layout') || key.includes('layout-sync')) {
                    cache.remove(key);
                }
            });
        },
        onError: (error) => {
            toast.error(`Failed to update component: ${error.message}`);
        }
    });
}

async function updateSetContent(args: UpdateSetContentArgs): Promise<SetRow> {
    const { id, updates } = args;
    const result = await updateSetAction(id, updates);
    if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to update set content.');
    }
    const updatedSet = Array.isArray(result.data) ? result.data[0] : result.data;
    return updatedSet as SetRow;
}

export function useUpdateSetContentMutation() {
    const cache = useCacheStore();
    
    return useMutation<SetRow, Error, UpdateSetContentArgs>({
        mutationFn: updateSetContent,
        onSuccess: () => {
            toast.success('Set content updated.');
            Object.keys(cache.cache).forEach(key => {
                if (key.includes('home-layout') || key.includes('layout-sync')) {
                    cache.remove(key);
                }
            });
        },
        onError: (error) => {
            toast.error(`Failed to update set: ${error.message}`);
        }
    });
} 