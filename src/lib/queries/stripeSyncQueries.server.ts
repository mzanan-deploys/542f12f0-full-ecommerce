import { 
  getBulkProductSyncStatus,
  getStripeProductsList,
  syncAllProductsToStripe,
  cleanupInactiveStripeProducts
} from '@/lib/actions/stripeProductActions';
import { getProductsListAction } from '@/lib/actions/productActions';
import type { ProductSyncInfo, ProductsSyncDataResponse, StripeProductsDataResponse } from '@/types/stripe';

export async function getProductsSyncData(limit: number, offset: number): Promise<ProductsSyncDataResponse> {
  const productsResponse = await getProductsListAction({ 
    limit, 
    offset,
    orderBy: 'name',
    orderAsc: true
  });

  if (!productsResponse.success || !productsResponse.data) {
    throw new Error(productsResponse.error || 'Failed to fetch products');
  }

  const productIds = productsResponse.data.products.map(product => product.id);
  const bulkStatusResult = await getBulkProductSyncStatus(productIds);
  
  if (!bulkStatusResult.success || !bulkStatusResult.data) {
    throw new Error(bulkStatusResult.error || 'Failed to fetch sync status');
  }

  const productSyncInfos: ProductSyncInfo[] = productsResponse.data.products.map((product) => {
    const syncStatus = bulkStatusResult.data![product.id];
    return {
      id: product.id,
      name: product.name,
      price: parseFloat(String(product.price)) || 0,
      isActive: product.is_active ?? false,
      variantCount: syncStatus?.variantCount || 0,
      isInStripe: syncStatus?.isInStripe || false,
      stripeProductId: syncStatus?.stripeProductId,
      syncedVariants: syncStatus?.syncedVariants || 0,
      lastSynced: syncStatus?.lastSynced,
    };
  });

  return {
    products: productSyncInfos,
    count: productsResponse.data.count || 0
  };
}

export async function getStripeProductsData(limit: number, offset: number): Promise<StripeProductsDataResponse> {
  const stripeProductsResponse = await getStripeProductsList({ 
    limit, 
    offset 
  });

  if (!stripeProductsResponse.success || !stripeProductsResponse.data) {
    throw new Error(stripeProductsResponse.error || 'Failed to fetch Stripe products');
  }

  return {
    products: stripeProductsResponse.data.products,
    count: stripeProductsResponse.data.count || 0
  };
}

export { syncAllProductsToStripe, cleanupInactiveStripeProducts }; 