import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useProductsSyncData, 
  useStripeProductsData,
  useSyncAllProducts,
  useCleanupInactiveProducts,
  stripeSyncQueryKeys
} from '@/lib/queries/stripeSyncQueries';
import type { 
  UseStripeSyncPageClientProps, 
  ProductSyncInfo, 
  StripeSyncStats 
} from '@/types/stripe';

export function useStripeSyncPageClient({ itemsPerPage = 10 }: UseStripeSyncPageClientProps = {}) {
  const [productsPage, setProductsPage] = useState(1);
  const [stripeProductsPage, setStripeProductsPage] = useState(1);
  const queryClient = useQueryClient();

  const { 
    data: productsData, 
    isLoading: isLoadingProducts,
    isFetching: isFetchingProducts
  } = useProductsSyncData(productsPage, itemsPerPage);

  const { 
    data: stripeProductsData, 
    isLoading: isLoadingStripeProducts,
    isFetching: isFetchingStripeProducts
  } = useStripeProductsData(stripeProductsPage, itemsPerPage);

  const syncAllMutation = useSyncAllProducts();
  const cleanupMutation = useCleanupInactiveProducts();

  const loading = isLoadingProducts || isLoadingStripeProducts;
  const fetching = isFetchingProducts || isFetchingStripeProducts;
  
  const products = useMemo(() => productsData?.products || [], [productsData]);
  const stripeProducts = useMemo(() => stripeProductsData?.products || [], [stripeProductsData]);
  const totalProducts = useMemo(() => productsData?.count || 0, [productsData]);
  const totalStripeProducts = useMemo(() => stripeProductsData?.count || 0, [stripeProductsData]);

  const stats: StripeSyncStats = useMemo(() => {
    const activeProducts = products.filter(p => p.isActive);
    const syncedProducts = activeProducts.filter(p => p.isInStripe);
    const fullySyncedProducts = activeProducts.filter(p => 
      p.isInStripe && p.syncedVariants === p.variantCount && p.variantCount > 0
    );

    return {
      totalProducts,
      syncedProducts: syncedProducts.length,
      fullySyncedProducts: fullySyncedProducts.length,
      totalStripeProducts,
    };
  }, [products, totalProducts, totalStripeProducts]);

  const productsTotalPages = useMemo(() => Math.ceil(totalProducts / itemsPerPage), [totalProducts, itemsPerPage]);
  const stripeProductsTotalPages = useMemo(() => Math.ceil(totalStripeProducts / itemsPerPage), [totalStripeProducts, itemsPerPage]);

  const handleSyncAll = useCallback(() => {
    syncAllMutation.mutate();
  }, [syncAllMutation]);

  const handleCleanup = useCallback(() => {
    cleanupMutation.mutate();
  }, [cleanupMutation]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: stripeSyncQueryKeys.all });
  }, [queryClient]);

  const getSyncStatusBadge = useCallback((product: ProductSyncInfo) => {
    if (!product.isInStripe) 
      return { variant: 'destructive' as const, text: 'Not in Stripe' };
    
    if (product.syncedVariants === product.variantCount && product.variantCount > 0) 
      return { variant: 'default' as const, text: 'Fully Synced' };
    
    if (product.syncedVariants > 0) 
      return { variant: 'secondary' as const, text: 'Partially Synced' };
    
    return { variant: 'outline' as const, text: 'Product Only' };
  }, []);

  const getSyncIcon = useCallback((product: ProductSyncInfo) => {
    if (!product.isInStripe) 
      return { icon: 'XCircle', className: 'h-4 w-4 text-destructive' };
    
    if (product.syncedVariants === product.variantCount && product.variantCount > 0) 
      return { icon: 'CheckCircle', className: 'h-4 w-4 text-green-600' };
    
    return { icon: 'AlertCircle', className: 'h-4 w-4 text-yellow-600' };
  }, []);

  return {
    products,
    stripeProducts,
    loading,
    fetching,
    stats,
    productsPage,
    setProductsPage,
    stripeProductsPage,
    setStripeProductsPage,
    productsTotalPages,
    stripeProductsTotalPages,
    syncingAll: syncAllMutation.isPending,
    cleaningUp: cleanupMutation.isPending,
    handleSyncAll,
    handleCleanup,
    handleRefresh,
    getSyncStatusBadge,
    getSyncIcon,
  };
} 