export interface CreatePaymentIntentResponse {
  clientSecret?: string;
  error?: string;
}

export interface OrderItemDetail {
  variantId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number; 
  size: string | null;
  name?: string;
}

export interface StripeValidationResult {
  isValid: boolean;
  missingSyncItems: string[];
  errors: string[];
}

export interface StripeProductSyncResult {
  stripeProductId: string;
}

export interface StripeVariantSyncResult {
  syncedPrices: number;
}

export interface StripeCompleteSyncResult {
  stripeProductId: string;
  syncedPrices: number;
}

export interface StripeAllProductsSyncResult {
  syncedProducts: number;
  totalVariants: number;
}

export interface StripeProductSyncStatus {
  isInStripe: boolean;
  stripeProductId?: string;
  variantCount: number;
  syncedVariants: number;
  lastSynced?: string;
}

export interface StripeProductInfo {
  stripeId: string;
  name: string;
  productId: string;
  priceCount: number;
  lastSynced?: string;
}

export interface StripeProductsListResult {
  products: StripeProductInfo[];
  count: number;
}

export interface StripeCleanupResult {
  archivedProducts: number;
  deletedPrices: number;
}

export interface ProductSyncInfo {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  variantCount: number;
  isInStripe: boolean;
  stripeProductId?: string;
  syncedVariants: number;
  lastSynced?: string;
}

export interface StripeProduct {
  stripeId: string;
  name: string;
  productId: string;
  priceCount: number;
  lastSynced?: string;
}

export interface StripeSyncStats {
  totalProducts: number;
  syncedProducts: number;
  fullySyncedProducts: number;
  totalStripeProducts: number;
}

export interface UseStripeSyncPageClientProps {
  itemsPerPage?: number;
}

export interface StripeSyncPageData {
  products: ProductSyncInfo[];
  stripeProducts: StripeProduct[];
  totalProducts: number;
  totalStripeProducts: number;
}

export interface ProductsSyncDataResponse {
  products: ProductSyncInfo[];
  count: number;
}

export interface StripeProductsDataResponse {
  products: StripeProductInfo[];
  count: number;
}