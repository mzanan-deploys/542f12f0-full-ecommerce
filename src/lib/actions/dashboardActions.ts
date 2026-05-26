"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/authz";
import { sendOrderConfirmationEmail } from "@/lib/email/sendOrderConfirmation";
import type { ActionResponse } from "@/types/actions";
import type { SaleOrder } from "@/types/dashboard";

export async function updateOrderStatusAction(formData: FormData): Promise<ActionResponse> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("newStatus") as SaleOrder["shipping_status"];
  const currentStatus = formData.get("currentStatus") as SaleOrder["shipping_status"];
  const pageToRevalidate = (formData.get("currentPage") as string) || "1";

  if (!orderId || !newStatus || !currentStatus) {
    return { success: false, error: "Missing required parameters" };
  }

  if (currentStatus === "pending" && newStatus !== "in_transit") {
    return { success: false, error: "Invalid status transition" };
  }
  if (currentStatus === "in_transit" && newStatus !== "delivered") {
    return { success: false, error: "Invalid status transition" };
  }
  if (currentStatus === "delivered") {
    return { success: false, error: "Order already delivered" };
  }

  try {
    await db
      .update(orders)
      .set({ shippingStatus: newStatus, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to update order status: ${message}` };
  }

  if (newStatus === "in_transit" || newStatus === "delivered") {
    sendOrderConfirmationEmail(orderId).catch((err) => {
      console.error(`[updateOrderStatusAction] email for order ${orderId}`, err);
    });
  }

  revalidatePath(`/admin/dashboard?page=${pageToRevalidate}`);
  return { success: true, message: `Order status updated to ${newStatus}` };
}

export async function syncStuckOrdersAction(): Promise<ActionResponse> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }
  revalidatePath("/admin/dashboard");
  return { success: true, message: "No-op: implement Stripe reconciliation here." };
}
