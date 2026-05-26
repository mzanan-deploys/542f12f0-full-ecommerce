import { useQuery, useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCacheStore } from '@/store/cacheStore';
import {
  getProductsListAction,
  getProductBySlugAction,
  getProductByIdForEdit as getProductByIdForEditAction,
  createProduct as createProductAction,
  updateProduct as updateProductAction,
  deleteProduct as deleteProductAction,
} from '@/lib/actions/productActions';
import type { ProductListResponse, ProductPageData, ProductByIdEditResponse } from '@/types/product';
import type { ActionResponse } from '@/types/actions';
import { toast } from 'sonner';

interface GetProductsListParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderAsc?: boolean;
  filters?: Record<string, any>;
}

export function useProductsList(params: GetProductsListParams) {
  const cache = useCacheStore();
  const cacheKey = `products-list-${JSON.stringify(params)}`;
  
  return useQuery<ProductListResponse, Error>({
    queryKey: ['products', params], 
    queryFn: async () => {
      const cached = cache.get<ProductListResponse>(cacheKey);
      if (cached) return cached;
      
      const data = await getProductsListAction(params);
      cache.set(cacheKey, data, 5 * 60 * 1000);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useProductBySlug(slug: string, options?: { enabled?: boolean }) {
  const cache = useCacheStore();
  const cacheKey = `product-slug-${slug}`;
  
  return useQuery<ActionResponse<ProductPageData>, Error>({
    queryKey: ['product', { slug }],
    queryFn: async () => {
      const cached = cache.get<ActionResponse<ProductPageData>>(cacheKey);
      if (cached) return cached;
      
      const data = await getProductBySlugAction({ slug });
      cache.set(cacheKey, data, 5 * 60 * 1000);
      return data;
    },
    enabled: options?.enabled ?? !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSuspenseProductBySlug(slug: string) {
  return useSuspenseQuery<ActionResponse<ProductPageData>, Error>({
    queryKey: ['product', { slug }],
    queryFn: () => getProductBySlugAction({ slug }),
  });
}

export function useProductByIdForEdit(productId: string, options?: { enabled?: boolean }) {
  const cache = useCacheStore();
  const cacheKey = `product-edit-${productId}`;
  
  return useQuery<ProductByIdEditResponse, Error>({
    queryKey: ['product', { productId, edit: true }],
    queryFn: async () => {
      const cached = cache.get<ProductByIdEditResponse>(cacheKey);
      if (cached) return cached;
      
      const data = await getProductByIdForEditAction(productId);
      cache.set(cacheKey, data, 5 * 60 * 1000);
      return data;
    },
    enabled: options?.enabled ?? !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const cache = useCacheStore();
  
  return useMutation<
    ActionResponse,
    Error,
    FormData
  >({
    mutationFn: (formData: FormData) => createProductAction(null, formData),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Product created successfully!');
        queryClient.invalidateQueries({ queryKey: ['products'] });
        Object.keys(cache.cache).forEach(key => {
          if (key.includes('products-list')) {
            cache.remove(key);
          }
        });
      } else {
        toast.error(data.error || 'Failed to create product.');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create product due to validation or database error.');
    },
  });
}

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient();
  const cache = useCacheStore();
  
  return useMutation<
    ActionResponse,
    Error,
    FormData
  >({
    mutationFn: (formData: FormData) => updateProductAction(productId, null, formData),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Product updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['product', productId] });
        Object.keys(cache.cache).forEach(key => {
          if (key.includes('products-list') || key.includes(`product-edit-${productId}`) || key.includes(`product-slug-`)) {
            cache.remove(key);
          }
        });
      } else {
        toast.error(data.error || 'Failed to update product.');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update product due to validation or database error.');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const cache = useCacheStore();
  
  return useMutation<
    ActionResponse,
    Error,
    string,
    { previousProducts: [any, any][] }
  >({
    mutationFn: (productId: string) => deleteProductAction(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      
      const previousProducts = queryClient.getQueriesData({ queryKey: ['products'] });
      
      queryClient.setQueriesData({ queryKey: ['products'] }, (oldData: any) => {
        if (!oldData?.success || !oldData?.data?.products) return oldData;
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            products: oldData.data.products.filter((p: any) => p.id !== productId),
            count: (oldData.data.count || 0) - 1
          }
        };
      });
      
      return { previousProducts };
    },
    onSuccess: (data, productId) => {
      if (data.success) {
        toast.success(data.message || 'Product deleted successfully!');
        queryClient.removeQueries({ queryKey: ['product', productId] });
        Object.keys(cache.cache).forEach(key => {
          if (key.includes('products-list') || key.includes(`product-edit-${productId}`) || key.includes(`product-slug-`)) {
            cache.remove(key);
          }
        });
      } else {
        toast.error(data.error || 'Failed to delete product.');
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    },
    onError: (error, productId, context) => {
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error.message || 'Failed to delete product due to database error.');
    },
  });
} 