"use server";

import { and, asc, eq, inArray } from "drizzle-orm";
import Stripe from "stripe";

import { db } from "@/db";
import { productImages, productVariants, products } from "@/db/schema";
import type { ActionResponse } from "@/types/actions";
import type {
  StripeAllProductsSyncResult,
  StripeCleanupResult,
  StripeProductSyncResult,
  StripeProductSyncStatus,
  StripeProductsListResult,
  StripeVariantSyncResult,
} from "@/types/stripe";

let cachedStripe: Stripe | null = null;
function getStripe(): Stripe {
  if (cachedStripe) return cachedStripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Stripe not configured. Set STRIPE_SECRET_KEY in your Vercel project to enable product sync.",
    );
  }
  cachedStripe = new Stripe(key, {
    apiVersion: "2025-04-30.basil" as Stripe.LatestApiVersion,
  });
  return cachedStripe;
}

export async function syncProductToStripe(
  productId: string,
): Promise<ActionResponse<StripeProductSyncResult>> {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!product) return { success: false, error: "Product not found in database" };

    const images = await db
      .select({ imageUrl: productImages.imageUrl, position: productImages.position })
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.position));

    const sortedImages = images
      .map((img) => img.imageUrl)
      .filter(Boolean)
      .slice(0, 8);

    let stripeProduct: Stripe.Product;
    try {
      const existing = await getStripe().products.search({
        query: `metadata["product_id"]:"${productId}"`,
        limit: 1,
      });

      const payload: Stripe.ProductCreateParams = {
        name: product.name,
        description: product.description || undefined,
        images: sortedImages,
        metadata: {
          product_id: productId,
          last_synced: new Date().toISOString(),
        },
      };

      stripeProduct =
        existing.data.length > 0
          ? await getStripe().products.update(existing.data[0].id, payload)
          : await getStripe().products.create(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stripe error";
      return { success: false, error: `Stripe error: ${message}` };
    }

    await db
      .update(products)
      .set({ updatedAt: new Date() })
      .where(eq(products.id, productId));

    return {
      success: true,
      data: { stripeProductId: stripeProduct.id },
      message: `Product "${product.name}" synced to Stripe`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function syncVariantPricesToStripe(
  productId: string,
  stripeProductIdFromSync?: string,
): Promise<ActionResponse<StripeVariantSyncResult>> {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!product) return { success: false, error: "Product not found in database" };

    const variants = await db
      .select({ id: productVariants.id, sizeName: productVariants.sizeName })
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    let stripeProduct: { id: string } | null = stripeProductIdFromSync
      ? { id: stripeProductIdFromSync }
      : null;

    if (!stripeProduct) {
      const existing = await getStripe().products.search({
        query: `metadata["product_id"]:"${productId}"`,
        limit: 1,
      });
      if (existing.data.length > 0) {
        stripeProduct = existing.data[0];
      } else {
        return { success: false, error: "Product not found in Stripe. Sync product first." };
      }
    }

    let syncedCount = 0;
    const priceInCents = Math.round(parseFloat(String(product.price)) * 100);

    for (const variant of variants) {
      try {
        const existingPrices = await getStripe().prices.search({
          query: `metadata["variant_id"]:"${variant.id}"`,
          limit: 1,
        });

        if (existingPrices.data.length === 0) {
          await getStripe().prices.create({
            product: stripeProduct.id,
            unit_amount: priceInCents,
            currency: "usd",
            metadata: {
              variant_id: variant.id,
              product_id: productId,
              size_name: variant.sizeName,
              last_synced: new Date().toISOString(),
            },
          });
          syncedCount++;
        } else {
          const existing = existingPrices.data[0];
          if (existing.unit_amount !== priceInCents) {
            await getStripe().prices.create({
              product: stripeProduct.id,
              unit_amount: priceInCents,
              currency: "usd",
              metadata: {
                variant_id: variant.id,
                product_id: productId,
                size_name: variant.sizeName,
                last_synced: new Date().toISOString(),
              },
            });
            await getStripe().prices.update(existing.id, { active: false });
            syncedCount++;
          }
        }
      } catch (variantError) {
        console.error(`[stripeProductActions] variant ${variant.id} sync failed`, variantError);
      }
    }

    return {
      success: true,
      data: { syncedPrices: syncedCount },
      message: `Synced ${syncedCount} variant prices for "${product.name}"`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function syncAllProductsToStripe(): Promise<ActionResponse<StripeAllProductsSyncResult>> {
  try {
    const activeProducts = await db
      .select({ id: products.id, name: products.name })
      .from(products)
      .where(eq(products.isActive, true));

    if (activeProducts.length === 0) {
      return {
        success: true,
        data: { syncedProducts: 0, totalVariants: 0 },
        message: "No active products to sync",
      };
    }

    let syncedProducts = 0;
    let totalVariants = 0;
    const errors: string[] = [];

    for (const product of activeProducts) {
      try {
        const productResult = await syncProductToStripe(product.id);
        if (!productResult.success) {
          errors.push(`${product.name}: ${productResult.error}`);
          continue;
        }
        const pricesResult = await syncVariantPricesToStripe(
          product.id,
          productResult.data?.stripeProductId,
        );
        if (pricesResult.success) {
          syncedProducts++;
          totalVariants += pricesResult.data?.syncedPrices || 0;
        } else {
          errors.push(`${product.name}: ${pricesResult.error}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        errors.push(`${product.name}: ${message}`);
      }
    }

    const baseMessage = `Synced ${syncedProducts}/${activeProducts.length} products with ${totalVariants} total variants`;
    return {
      success: errors.length === 0,
      data: { syncedProducts, totalVariants },
      message: errors.length > 0 ? `${baseMessage}. Errors: ${errors.join("; ")}` : baseMessage,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getBulkProductSyncStatus(
  productIds: string[],
): Promise<ActionResponse<Record<string, StripeProductSyncStatus>>> {
  try {
    const variants = await db
      .select({ id: productVariants.id, productId: productVariants.productId })
      .from(productVariants)
      .where(inArray(productVariants.productId, productIds));

    const variantsByProduct: Record<string, Array<{ id: string }>> = {};
    for (const variant of variants) {
      (variantsByProduct[variant.productId] ??= []).push({ id: variant.id });
    }

    let allStripeProducts: Stripe.Product[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;
    while (hasMore) {
      const resp = await getStripe().products.list({ limit: 100, starting_after: startingAfter });
      allStripeProducts = allStripeProducts.concat(resp.data);
      hasMore = resp.has_more;
      if (hasMore && resp.data.length > 0) startingAfter = resp.data[resp.data.length - 1].id;
    }

    const stripeProductsByDbId = allStripeProducts
      .filter((p) => p.metadata?.product_id && productIds.includes(p.metadata.product_id))
      .reduce<Record<string, Stripe.Product>>((acc, p) => {
        acc[p.metadata.product_id] = p;
        return acc;
      }, {});

    let allStripePrices: Stripe.Price[] = [];
    hasMore = true;
    startingAfter = undefined;
    while (hasMore) {
      const resp: Stripe.ApiList<Stripe.Price> = await getStripe().prices.list({
        limit: 100,
        starting_after: startingAfter,
      });
      allStripePrices = allStripePrices.concat(resp.data);
      hasMore = resp.has_more;
      if (hasMore && resp.data.length > 0) startingAfter = resp.data[resp.data.length - 1].id;
    }

    const syncedVariantIds = new Set(
      allStripePrices.filter((p) => p.metadata?.variant_id).map((p) => p.metadata.variant_id),
    );

    const result: Record<string, StripeProductSyncStatus> = {};
    for (const productId of productIds) {
      const list = variantsByProduct[productId] || [];
      const variantCount = list.length;
      const stripeProduct = stripeProductsByDbId[productId];
      if (!stripeProduct) {
        result[productId] = { isInStripe: false, variantCount, syncedVariants: 0 };
      } else {
        const synced = list.filter((v) => syncedVariantIds.has(v.id)).length;
        result[productId] = {
          isInStripe: true,
          stripeProductId: stripeProduct.id,
          variantCount,
          syncedVariants: synced,
          lastSynced: stripeProduct.metadata.last_synced,
        };
      }
    }

    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getProductSyncStatus(
  productId: string,
): Promise<ActionResponse<StripeProductSyncStatus>> {
  try {
    const variants = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.productId, productId));
    const variantCount = variants.length;

    const existing = await getStripe().products.search({
      query: `metadata["product_id"]:"${productId}"`,
      limit: 1,
    });

    if (existing.data.length === 0) {
      return { success: true, data: { isInStripe: false, variantCount, syncedVariants: 0 } };
    }

    const stripeProduct = existing.data[0];
    let syncedVariants = 0;
    for (const variant of variants) {
      const prices = await getStripe().prices.search({
        query: `metadata["variant_id"]:"${variant.id}"`,
        limit: 1,
      });
      if (prices.data.length > 0) syncedVariants++;
    }

    return {
      success: true,
      data: {
        isInStripe: true,
        stripeProductId: stripeProduct.id,
        variantCount,
        syncedVariants,
        lastSynced: stripeProduct.metadata.last_synced,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getStripeProductsList(params?: {
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<StripeProductsListResult>> {
  try {
    let all: Stripe.Product[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;
    while (hasMore) {
      const resp = await getStripe().products.list({ limit: 100, starting_after: startingAfter });
      all = all.concat(resp.data);
      hasMore = resp.has_more;
      if (hasMore && resp.data.length > 0) startingAfter = resp.data[resp.data.length - 1].id;
    }

    const filtered = all.filter((p) => p.metadata?.product_id);
    const { limit = filtered.length, offset = 0 } = params || {};
    const paginated = filtered.slice(offset, offset + limit);

    const list = await Promise.all(
      paginated.map(async (product) => {
        const prices = await getStripe().prices.list({ product: product.id, limit: 100 });
        return {
          stripeId: product.id,
          name: product.name,
          productId: product.metadata.product_id,
          priceCount: prices.data.length,
          lastSynced: product.metadata.last_synced,
        };
      }),
    );

    return { success: true, data: { products: list, count: filtered.length } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function cleanupInactiveStripeProducts(): Promise<ActionResponse<StripeCleanupResult>> {
  try {
    const activeProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.isActive, true));
    const activeIds = new Set(activeProducts.map((p) => p.id));

    let all: Stripe.Product[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;
    while (hasMore) {
      const resp = await getStripe().products.list({ limit: 100, starting_after: startingAfter });
      all = all.concat(resp.data);
      hasMore = resp.has_more;
      if (hasMore && resp.data.length > 0) startingAfter = resp.data[resp.data.length - 1].id;
    }

    const filtered = all.filter((p) => p.metadata?.product_id);
    let archivedProducts = 0;
    let deletedPrices = 0;
    const errors: string[] = [];

    for (const stripeProduct of filtered) {
      const dbProductId = stripeProduct.metadata.product_id;
      if (!activeIds.has(dbProductId)) {
        try {
          const prices = await getStripe().prices.list({ product: stripeProduct.id, limit: 100 });
          for (const price of prices.data) {
            if (price.active) {
              await getStripe().prices.update(price.id, { active: false });
              deletedPrices++;
            }
          }
          await getStripe().products.update(stripeProduct.id, {
            active: false,
            metadata: {
              ...stripeProduct.metadata,
              archived_at: new Date().toISOString(),
              reason: "Product no longer active in database",
            },
          });
          archivedProducts++;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          errors.push(`${stripeProduct.name}: ${message}`);
        }
      }
    }

    const baseMessage = `Archived ${archivedProducts} products and ${deletedPrices} prices from Stripe`;
    return {
      success: errors.length === 0,
      data: { archivedProducts, deletedPrices },
      message: errors.length > 0 ? `${baseMessage}. Errors: ${errors.join("; ")}` : baseMessage,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

void and;
