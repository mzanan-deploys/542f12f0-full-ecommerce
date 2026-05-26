"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { orderItems, orders, products, productVariants } from "@/db/schema";
import { sendOrderConfirmationEmail } from "@/lib/email/sendOrderConfirmation";
import type { SaveOrderParams, SaveOrderResponse } from "@/types/order";
import { validateCartStockAction } from "@/lib/actions/stockActions";

export async function saveOrderAction(params: SaveOrderParams): Promise<SaveOrderResponse> {
  try {
    const stockValidation = await validateCartStockAction(
      params.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    );

    if (!stockValidation.success) {
      return { error: stockValidation.error || "Failed to validate stock" };
    }

    if (!stockValidation.data?.isValid) {
      const invalid = stockValidation.data?.stockValidation.filter((i) => !i.isValid) || [];
      return {
        error: `Stock validation failed: ${invalid.map((i) => i.errorMessage).join(", ")}`,
      };
    }

    const productsTotal = params.items.reduce(
      (sum, item) => sum + item.quantity * item.priceAtPurchase,
      0,
    );
    const shippingPrice = params.shippingPrice || 0;
    const expectedTotal = productsTotal + shippingPrice;
    if (Math.abs(params.totalAmount - expectedTotal) > 0.01) {
      console.warn("[saveOrderAction] total mismatch", {
        provided: params.totalAmount,
        calculated: expectedTotal,
      });
    }

    const detailItems: Array<{
      product_variant_id: string;
      product_id: string;
      quantity: number;
      price_at_purchase: number;
      size: string | null;
      product_name: string;
    }> = [];

    for (const item of params.items) {
      let productName = item.name ?? "Unknown Product";
      try {
        const [row] = await db
          .select({ name: products.name })
          .from(productVariants)
          .innerJoin(products, eq(products.id, productVariants.productId))
          .where(eq(productVariants.id, item.variantId))
          .limit(1);
        if (row?.name) productName = row.name;
      } catch (e) {
        console.warn("[saveOrderAction] failed to resolve product name", e);
      }

      detailItems.push({
        product_variant_id: item.variantId,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_purchase: item.priceAtPurchase,
        size: item.size,
        product_name: productName,
      });
    }

    const orderDetails = { items: detailItems, shipping_price: shippingPrice };

    const [orderRow] = await db
      .insert(orders)
      .values({
        shippingName: params.shippingAddress.name,
        shippingEmail: params.shippingAddress.email,
        shippingPhone: params.shippingAddress.phone,
        shippingAddress1: params.shippingAddress.address1,
        shippingAddress2: params.shippingAddress.address2 || "",
        shippingCity: params.shippingAddress.city,
        shippingState: params.shippingAddress.state,
        shippingPostalCode: params.shippingAddress.postalCode,
        shippingCountry: params.shippingAddress.country,
        totalAmount: String(params.totalAmount),
        paymentIntentId: params.paymentIntentId,
        status: "paid",
        shippingStatus: "pending",
        orderDetails,
      })
      .returning({ id: orders.id });

    if (!orderRow) {
      return { error: "Failed to create order" };
    }

    try {
      await db.insert(orderItems).values(
        detailItems.map((d) => ({
          orderId: orderRow.id,
          productVariantId: d.product_variant_id,
          quantity: d.quantity,
          priceAtPurchase: String(d.price_at_purchase),
          productName: d.product_name,
          productSize: d.size,
        })),
      );
    } catch (itemsError) {
      console.error("[saveOrderAction] order_items insert failed", itemsError);
    }

    sendOrderConfirmationEmail(orderRow.id).catch((err) => {
      console.error("[saveOrderAction] confirmation email failed", err);
    });

    return { orderId: orderRow.id, userEmail: params.shippingAddress.email };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[saveOrderAction]", message);
    return { error: message };
  }
}
