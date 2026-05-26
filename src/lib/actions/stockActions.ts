"use server";

import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema";
import type { ActionResponse } from "@/types/actions";

export async function getCurrentStockAction(
  productId: string,
): Promise<ActionResponse<{ availableStock: number }>> {
  if (!productId) return { success: false, error: "Product ID is required" };
  try {
    const [row] = await db
      .select({ stockQuantity: products.stockQuantity })
      .from(products)
      .where(and(eq(products.id, productId), eq(products.isActive, true)))
      .limit(1);
    return { success: true, data: { availableStock: row?.stockQuantity ?? 0 } };
  } catch (error) {
    console.error("[getCurrentStockAction]", error);
    return { success: false, error: "Unexpected error while retrieving stock" };
  }
}

export async function validateCartStockAction(
  cartItems: Array<{ productId: string; variantId: string; quantity: number }>,
): Promise<
  ActionResponse<{
    isValid: boolean;
    stockValidation: Array<{
      productId: string;
      availableStock: number;
      requestedQuantity: number;
      isValid: boolean;
      errorMessage?: string;
    }>;
  }>
> {
  if (!cartItems || cartItems.length === 0) {
    return { success: true, data: { isValid: true, stockValidation: [] } };
  }

  try {
    const productQuantities = cartItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      return acc;
    }, {});

    const productIds = Object.keys(productQuantities);
    const stockData = await db
      .select({ id: products.id, stockQuantity: products.stockQuantity })
      .from(products)
      .where(and(inArray(products.id, productIds), eq(products.isActive, true)));

    const stockValidation = stockData.map((product) => {
      const requestedQuantity = productQuantities[product.id];
      const availableStock = product.stockQuantity || 0;
      const isValid = availableStock >= requestedQuantity;
      return {
        productId: product.id,
        availableStock,
        requestedQuantity,
        isValid,
        errorMessage: !isValid
          ? `Insufficient stock: available ${availableStock}, requested ${requestedQuantity}`
          : undefined,
      };
    });

    return {
      success: true,
      data: { isValid: stockValidation.every((s) => s.isValid), stockValidation },
    };
  } catch (error) {
    console.error("[validateCartStockAction]", error);
    return { success: false, error: "Unexpected error during stock validation" };
  }
}

export async function getMultipleProductStockAction(
  productIds: string[],
): Promise<ActionResponse<{ stockLevels: Record<string, number> }>> {
  if (!productIds || productIds.length === 0) {
    return { success: true, data: { stockLevels: {} } };
  }
  try {
    const data = await db
      .select({ id: products.id, stockQuantity: products.stockQuantity })
      .from(products)
      .where(and(inArray(products.id, productIds), eq(products.isActive, true)));

    const stockLevels = data.reduce<Record<string, number>>((acc, p) => {
      acc[p.id] = p.stockQuantity || 0;
      return acc;
    }, {});

    return { success: true, data: { stockLevels } };
  } catch (error) {
    console.error("[getMultipleProductStockAction]", error);
    return { success: false, error: "Unexpected error while retrieving stock levels" };
  }
}
