import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { orderItems, orders, productVariants, products } from "@/db/schema";
import OrderConfirmation from "@/emails/OrderConfirmation";
import { getFromAddress, getResend, getStoreName, getSupportEmail } from "./resend";

type SendResult = { success: boolean; error?: string };

export async function sendOrderConfirmationEmail(orderId: string): Promise<SendResult> {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) {
      return { success: false, error: `Order ${orderId} not found` };
    }
    if (!order.shippingEmail) {
      return { success: false, error: `Order ${orderId} has no shipping email` };
    }

    const items = await db
      .select({
        productName: orderItems.productName,
        size: orderItems.productSize,
        quantity: orderItems.quantity,
        price: orderItems.priceAtPurchase,
        productNameFallback: products.name,
      })
      .from(orderItems)
      .leftJoin(productVariants, eq(productVariants.id, orderItems.productVariantId))
      .leftJoin(products, eq(products.id, productVariants.productId))
      .where(and(eq(orderItems.orderId, orderId)));

    const resend = getResend();
    const storeName = getStoreName();
    const supportEmail = getSupportEmail();

    const { error } = await resend.emails.send({
      from: `${storeName} <${getFromAddress()}>`,
      to: [order.shippingEmail],
      subject: `Your ${storeName} order is confirmed`,
      react: OrderConfirmation({
        storeName,
        orderId: order.id,
        customerName: order.shippingName ?? "Customer",
        shipping: {
          address1: order.shippingAddress1 ?? "",
          address2: order.shippingAddress2,
          city: order.shippingCity ?? "",
          state: order.shippingState,
          postalCode: order.shippingPostalCode,
          country: order.shippingCountry,
        },
        items: items.map((it) => ({
          name: it.productName ?? it.productNameFallback ?? "Item",
          size: it.size,
          quantity: it.quantity,
          price: Number(it.price ?? 0),
        })),
        totalAmount: Number(order.totalAmount ?? 0),
        currency: process.env.NEXT_PUBLIC_STORE_CURRENCY ?? "USD",
        supportEmail,
      }),
    });

    if (error) {
      console.error("[email] Resend error", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[email] sendOrderConfirmationEmail failed", message);
    return { success: false, error: message };
  }
}
