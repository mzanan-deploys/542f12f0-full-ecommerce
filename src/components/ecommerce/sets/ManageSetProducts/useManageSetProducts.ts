import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCacheStore } from '@/store/cacheStore';
import { toast } from 'sonner';
import type { ActionResponse } from '@/types/actions';
import type { ProductWithPosition } from '@/types/db';
import type { AvailableProductsResult } from '@/types/sets';
import { addProductToSetAction } from '@/lib/actions/addProductToSetAction';
import { removeProductFromSetAction } from '@/lib/actions/removeProductFromSetAction';
import { getAvailableProductsForSetAction, getProductsInSetAction } from '@/lib/queries/setQueries.server';
import { useDebounce } from '@/hooks/useDebounce';

const ITEMS_PER_PAGE = 25;

export function useManageSetProducts(setId: string, initialAssociatedProducts?: ProductWithPosition[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const [associatedSearchTerm, setAssociatedSearchTerm] = useState('');
    const [loadedPages, setLoadedPages] = useState(1);
    const [allAvailableProducts, setAllAvailableProducts] = useState<any[]>([]);
    const [hasMoreProducts, setHasMoreProducts] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const queryClient = useQueryClient();
    const cache = useCacheStore();

    const { data: assignedProductsData, isLoading: isLoadingAssigned } = useQuery<ProductWithPosition[]>({
        queryKey: ['assigned-products', setId],
        queryFn: async () => {
            const cacheKey = `assigned-products-${setId}`;
            const cached = cache.get<ProductWithPosition[]>(cacheKey);
            if (cached) return cached;
            
            const result = await getProductsInSetAction(setId);
            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to fetch assigned products');
            }
            const data = result.data.products.sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
            cache.set(cacheKey, data, 3 * 60 * 1000);
            return data;
        },
        enabled: !!setId,
        initialData: initialAssociatedProducts,
        staleTime: 3 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const { 
        data: availableProductsData, 
        isLoading: isLoadingAvailable,
    } = useQuery<AvailableProductsResult['data']>({
        queryKey: ['available-products', setId, debouncedSearchTerm, loadedPages],
        queryFn: async () => {
            const cacheKey = `available-products-${setId}-${debouncedSearchTerm}-${loadedPages}`;
            const cached = cache.get<AvailableProductsResult['data']>(cacheKey);
            if (cached) return cached;
            
            if (debouncedSearchTerm) {
                const result = await getAvailableProductsForSetAction(setId, { 
                    search: debouncedSearchTerm,
                    limit: 100,
                    offset: 0
                });
                if (!result.success || !result.data) {
                    throw new Error(result.error || 'Failed to fetch available products');
                }
                cache.set(cacheKey, result.data, 2 * 60 * 1000);
                return result.data;
            } else {
                const result = await getAvailableProductsForSetAction(setId, { 
                    search: '',
                    limit: ITEMS_PER_PAGE,
                    offset: (loadedPages - 1) * ITEMS_PER_PAGE
                });
                if (!result.success || !result.data) {
                    throw new Error(result.error || 'Failed to fetch available products');
                }
                cache.set(cacheKey, result.data, 2 * 60 * 1000);
                return result.data;
            }
        },
        enabled: !!setId,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (availableProductsData) {
            if (debouncedSearchTerm) {
                setAllAvailableProducts(availableProductsData.products);
                setHasMoreProducts(false);
            } else {
                if (loadedPages === 1) {
                    setAllAvailableProducts(availableProductsData.products);
                } else {
                    setAllAvailableProducts(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const newProducts = availableProductsData.products.filter(p => !existingIds.has(p.id));
                        return [...prev, ...newProducts];
                    });
                }
                const count = availableProductsData.count || 0;
                setHasMoreProducts(availableProductsData.products.length === ITEMS_PER_PAGE && allAvailableProducts.length + availableProductsData.products.length < count);
            }
        }
    }, [availableProductsData, debouncedSearchTerm, loadedPages]);

    const loadMoreProducts = useCallback(async () => {
        if (isLoadingMore || !hasMoreProducts || debouncedSearchTerm) return;
        
        setIsLoadingMore(true);
        setLoadedPages(prev => prev + 1);
        setIsLoadingMore(false);
    }, [isLoadingMore, hasMoreProducts, debouncedSearchTerm]);

    const assignedProducts = useMemo(() => assignedProductsData || [], [assignedProductsData]);
    const totalAvailableCount = useMemo(() => availableProductsData?.count || 0, [availableProductsData]);

    const getProductImageUrl = useCallback((product: any) => {
        if (product.thumbnail_url) return product.thumbnail_url;
        if (product.product_images?.[0]?.image_url) return product.product_images[0].image_url;
        return null;
    }, []);

    const addMutation = useMutation<ActionResponse, Error, string>({
        mutationFn: (productId: string) => addProductToSetAction(setId, productId),
        onSuccess: (result) => {
                if (result.success) {
                toast.success('Product added to set');
                queryClient.invalidateQueries({ queryKey: ['assigned-products', setId] });
                Object.keys(cache.cache).forEach(key => {
                    if (key.includes(`assigned-products-${setId}`)) {
                        cache.remove(key);
                    }
                });
                } else {
                toast.error(`Failed to add product: ${result.error}`);
            }
        },
        onError: (error) => {
            toast.error(`An error occurred: ${error.message}`);
            }
        });

    const removeMutation = useMutation<ActionResponse, Error, string>({
        mutationFn: (productId: string) => removeProductFromSetAction(setId, productId),
        onSuccess: (result) => {
                if (result.success) {
                toast.success('Product removed from set');
                queryClient.invalidateQueries({ queryKey: ['assigned-products', setId] });
                Object.keys(cache.cache).forEach(key => {
                    if (key.includes(`assigned-products-${setId}`)) {
                        cache.remove(key);
                    }
                });
                } else {
                toast.error(`Failed to remove product: ${result.error}`);
                }
        },
        onError: (error) => {
            toast.error(`An error occurred: ${error.message}`);
            }
        });
    
    useEffect(() => {
        setLoadedPages(1);
        setAllAvailableProducts([]);
        setHasMoreProducts(true);
    }, [debouncedSearchTerm]);

    return {
        assignedProducts,
        availableProducts: allAvailableProducts,
        isLoading: isLoadingAssigned || isLoadingAvailable,
        isLoadingMore,
        hasMoreProducts,
        loadMoreProducts,
        totalAvailableCount,
        searchTerm,
        setSearchTerm,
        associatedSearchTerm,
        setAssociatedSearchTerm,
        getProductImageUrl,
        addProduct: addMutation.mutate,
        isAddingProduct: addMutation.isPending,
        removeProduct: removeMutation.mutate,
        isRemovingProduct: removeMutation.isPending,
    };
} 