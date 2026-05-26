"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import type { ActionResponse } from "@/types/actions";
import type { CartActionResult, CartUpdateResult, CurrentCartItem } from "@/types/cart";
import { getCurrentStockAction } from "./stockActions";

export async function addItemToCartAction(
  variantId: string,
  quantity: number,
  currentCartItems?: CurrentCartItem[],
): Promise<ActionResponse<CartActionResult>> {
  if (!variantId) return { success: false, error: "Variant ID is required." };
  if (isNaN(quantity) || quantity < 1) return { success: false, error: "Invalid quantity." };

  try {
    const [variant] = await db
      .select({ productId: productVariants.productId, sizeName: productVariants.sizeName })
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);
    if (!variant) return { success: false, error: "Product variant not found." };

    const [product] = await db
      .select({ name: products.name, slug: products.slug, stockQuantity: products.stockQuantity })
      .from(products)
      .where(eq(products.id, variant.productId))
      .limit(1);
    if (!product || !product.slug) {
      return { success: false, error: "Failed to retrieve product details." };
    }

    const productName = product.name;
    const productSize = variant.sizeName || "N/A";

    const stockResult = await getCurrentStockAction(variant.productId);
    if (!stockResult.success) {
      return { success: false, error: "Failed to check stock availability" };
    }

    const currentStock = stockResult.data?.availableStock || 0;

    const usedByVariants = currentCartItems
      ? currentCartItems
          .filter((item) => item.productId === variant.productId)
          .reduce((sum, item) => sum + item.quantity, 0)
      : 0;

    const effective = Math.max(0, currentStock - usedByVariants);
    if (effective < quantity) {
      return {
        success: false,
        error: `Not enough stock for ${productName} (Size: ${productSize}). Only ${effective} effectively available.`,
      };
    }

    return {
      success: true,
      message: `${productName} (Size: ${productSize}) has been added to your cart.`,
      data: {
        productId: variant.productId,
        size: variant.sizeName,
        slug: product.slug,
        productName,
        validatedQuantity: quantity,
        availableStock: currentStock,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Server error: ${message}` };
  }
}

export async function updateCartItemQuantityAction(
  variantId: string,
  newQuantity: number,
  currentCartItems?: CurrentCartItem[],
): Promise<ActionResponse<CartUpdateResult>> {
  if (!variantId) return { success: false, error: "Variant ID is required." };
  if (isNaN(newQuantity) || newQuantity < 0) return { success: false, error: "Invalid quantity." };

  try {
    const [variant] = await db
      .select({ productId: productVariants.productId, sizeName: productVariants.sizeName })
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);
    if (!variant) return { success: false, error: "Product variant not found." };

    const [product] = await db
      .select({ name: products.name })
      .from(products)
      .where(eq(products.id, variant.productId))
      .limit(1);
    if (!product) return { success: false, error: "Failed to retrieve product details." };

    const stockResult = await getCurrentStockAction(variant.productId);
    if (!stockResult.success) {
      return { success: false, error: "Failed to check stock availability" };
    }

    const currentStock = stockResult.data?.availableStock || 0;
    const productName = product.name;
    const productSize = variant.sizeName || "N/A";

    const usedByOthers = currentCartItems
      ? currentCartItems
          .filter((item) => item.productId === variant.productId && item.variantId !== variantId)
          .reduce((sum, item) => sum + item.quantity, 0)
      : 0;

    const effective = Math.max(0, currentStock - usedByOthers);

    if (newQuantity === 0) {
      return {
        success: true,
        message: `${productName} (Size: ${productSize}) removed from your cart.`,
        data: {
          validatedQuantity: 0,
          availableStock: currentStock,
          productName,
          size: variant.sizeName,
        },
      };
    }

    if (effective < newQuantity) {
      return {
        success: true,
        message: `Quantity for ${productName} (Size: ${productSize}) adjusted to ${effective}.`,
        data: {
          validatedQuantity: effective,
          availableStock: currentStock,
          productName,
          size: variant.sizeName,
        },
      };
    }

    return {
      success: true,
      message: `Quantity for ${productName} (Size: ${productSize}) updated to ${newQuantity}.`,
      data: {
        validatedQuantity: newQuantity,
        availableStock: currentStock,
        productName,
        size: variant.sizeName,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Server error: ${message}` };
  }
}
