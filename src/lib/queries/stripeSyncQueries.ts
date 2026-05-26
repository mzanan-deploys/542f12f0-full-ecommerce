import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCacheStore } from '@/store/cacheStore';
import type { ProductsSyncDataResponse, StripeProductsDataResponse } from '@/types/stripe';
import { 
  getProductsSyncData, 
  getStripeProductsData,
  syncAllProductsToStripe,
  cleanupInactiveStripeProducts
} from './stripeSyncQueries.server';

export const stripeSyncQueryKeys = {
  all: ['stripe-sync'] as const,
  products: () => [...stripeSyncQueryKeys.all, 'products'] as const,
  productsList: (page: number, itemsPerPage: number) => [...stripeSyncQueryKeys.products(), 'list', page, itemsPerPage] as const,
  stripeProducts: () => [...stripeSyncQueryKeys.all, 'stripe-products'] as const,
  stripeProductsList: (page: number, itemsPerPage: number) => [...stripeSyncQueryKeys.stripeProducts(), 'list', page, itemsPerPage] as const,
};

export function useProductsSyncData(page: number, itemsPerPage: number) {
  const offset = (page - 1) * itemsPerPage;
  const cache = useCacheStore();
  const cacheKey = `products-sync-${page}-${itemsPerPage}`;
  
  return useQuery<ProductsSyncDataResponse>({
    queryKey: stripeSyncQueryKeys.productsList(page, itemsPerPage),
    queryFn: async () => {
      const cached = cache.get<ProductsSyncDataResponse>(cacheKey);
      if (cached) return cached;
      
      const data = await getProductsSyncData(itemsPerPage, offset);
      cache.set(cacheKey, data, 5 * 60 * 1000);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useStripeProductsData(page: number, itemsPerPage: number) {
  const offset = (page - 1) * itemsPerPage;
  const cache = useCacheStore();
  const cacheKey = `stripe-products-${page}-${itemsPerPage}`;
  
  return useQuery<StripeProductsDataResponse>({
    queryKey: stripeSyncQueryKeys.stripeProductsList(page, itemsPerPage),
    queryFn: async () => {
      const cached = cache.get<StripeProductsDataResponse>(cacheKey);
      if (cached) return cached;
      
      const data = await getStripeProductsData(itemsPerPage, offset);
      cache.set(cacheKey, data, 5 * 60 * 1000);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useSyncAllProducts() {
  const queryClient = useQueryClient();
  const cache = useCacheStore();
  
  return useMutation({
    mutationFn: syncAllProductsToStripe,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'All products synced successfully');
        queryClient.invalidateQueries({ queryKey: stripeSyncQueryKeys.products() });
        queryClient.invalidateQueries({ queryKey: stripeSyncQueryKeys.stripeProducts() });
        Object.keys(cache.cache).forEach(key => {
          if (key.includes('products-sync') || key.includes('stripe-products')) {
            cache.remove(key);
          }
        });
      } else {
        toast.error(result.error || 'Failed to sync all products');
      }
    },
    onError: (error) => {
      console.error('Error syncing all products:', error);
      toast.error('Error syncing all products');
    }
  });
}

export function useCleanupInactiveProducts() {
  const queryClient = useQueryClient();
  const cache = useCacheStore();
  
  return useMutation({
    mutationFn: cleanupInactiveStripeProducts,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Cleanup completed successfully');
        queryClient.invalidateQueries({ queryKey: stripeSyncQueryKeys.products() });
        queryClient.invalidateQueries({ queryKey: stripeSyncQueryKeys.stripeProducts() });
        Object.keys(cache.cache).forEach(key => {
          if (key.includes('products-sync') || key.includes('stripe-products')) {
            cache.remove(key);
          }
        });
      } else {
        toast.error(result.error || 'Failed to cleanup Stripe products');
      }
    },
    onError: (error) => {
      console.error('Error cleaning up Stripe products:', error);
      toast.error('Error cleaning up Stripe products');
    }
  });
} 