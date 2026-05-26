'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { useStripeSyncPageClient } from './useStripeSyncPageClient';
import type { ProductSyncInfo, StripeProduct } from '@/types/stripe';

export default function StripeSyncPageClient() {
  const {
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
    syncingAll,
    cleaningUp,
    handleSyncAll,
    handleCleanup,
    handleRefresh,
    getSyncStatusBadge,
    getSyncIcon,
  } = useStripeSyncPageClient();

  const renderSyncIcon = (iconData: ReturnType<typeof getSyncIcon>) => {
    const IconComponent = iconData.icon === 'XCircle' ? XCircle : 
                         iconData.icon === 'CheckCircle' ? CheckCircle : AlertCircle;
    return <IconComponent className={iconData.className} />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-muted rounded-md animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">Total products</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Stripe</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-muted rounded-md animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.syncedProducts}</div>
                <p className="text-xs text-muted-foreground">Products synced</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fully Synced</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-muted rounded-md animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.fullySyncedProducts}</div>
                <p className="text-xs text-muted-foreground">With all variants</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stripe Products</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-muted rounded-md animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalStripeProducts}</div>
                <p className="text-xs text-muted-foreground">Total in Stripe</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
          <CardDescription>
            Synchronize all active products with Stripe at once
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button 
            onClick={handleSyncAll}
            disabled={syncingAll || loading}
            className="flex items-center gap-2"
          >
            {syncingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Sync All Products
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={loading || fetching}
            className="flex items-center gap-2"
          >
            {fetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh Data
          </Button>

          <Button 
            variant="destructive"
            onClick={handleCleanup}
            disabled={cleaningUp || loading}
            className="flex items-center gap-2"
          >
            {cleaningUp ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Cleanup Inactive
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Product Synchronization Status
            {fetching && !loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            Individual product sync status and actions (Page {productsPage} of {productsTotalPages})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 w-full bg-muted rounded-md animate-pulse" />
              <div className="h-8 w-full bg-muted rounded-md animate-pulse" />
              <div className="h-8 w-full bg-muted rounded-md animate-pulse" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {products.map((product: ProductSyncInfo) => {
                  const badgeData = getSyncStatusBadge(product);
                  const iconData = getSyncIcon(product);
                  
                  return (
                    <div 
                      key={product.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {renderSyncIcon(iconData)}
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>${product.price}</span>
                            <span>•</span>
                            <span>{product.variantCount} variants</span>
                            {product.isInStripe && (
                              <>
                                <span>•</span>
                                <span>{product.syncedVariants} synced</span>
                              </>
                            )}
                            {product.lastSynced && (
                              <>
                                <span>•</span>
                                <span>Last: {new Date(product.lastSynced).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant={badgeData.variant}>{badgeData.text}</Badge>
                      </div>
                    </div>
                  );
                })}
                
                {products.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found
                  </div>
                )}
              </div>

              <Pagination
                currentPage={productsPage}
                totalPages={productsTotalPages}
                onPageChange={setProductsPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Products in Stripe
            {fetching && !loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            Products currently in your Stripe dashboard (Page {stripeProductsPage} of {stripeProductsTotalPages})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 w-full bg-muted rounded-md animate-pulse" />
              <div className="h-8 w-full bg-muted rounded-md animate-pulse" />
              <div className="h-8 w-full bg-muted rounded-md animate-pulse" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {stripeProducts.map((stripeProduct: StripeProduct) => (
                  <div 
                    key={stripeProduct.stripeId}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <h4 className="font-medium">{stripeProduct.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {stripeProduct.priceCount} prices
                        {stripeProduct.lastSynced && (
                          <span> • Last synced: {new Date(stripeProduct.lastSynced).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                    <Badge variant="outline">{stripeProduct.stripeId}</Badge>
                  </div>
                ))}

                {stripeProducts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No Stripe products found
                  </div>
                )}
              </div>

              <Pagination
                currentPage={stripeProductsPage}
                totalPages={stripeProductsTotalPages}
                onPageChange={setStripeProductsPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 