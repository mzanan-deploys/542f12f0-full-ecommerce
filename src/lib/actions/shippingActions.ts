"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appSettings, countryShippingPrices } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/authz";
import type { ShippingActionResult } from "@/types/shipping";

export async function deleteShippingPriceAction(id: number): Promise<ShippingActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized." };
  }
  if (!id) return { success: false, message: "No ID provided for deletion." };

  try {
    await db.delete(countryShippingPrices).where(eq(countryShippingPrices.id, id));
    revalidatePath("/admin/shipping-prices");
    return { success: true, message: "Shipping price deleted successfully!" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Failed to delete shipping price: ${message}` };
  }
}

export async function upsertShippingPriceAction(formData: FormData): Promise<ShippingActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized." };
  }

  const idString = formData.get("id") as string | null;
  const parsedId = idString ? parseInt(idString, 10) : undefined;

  const data = {
    country_code: formData.get("country_code") as string,
    country_name: (formData.get("country_name") as string | null) ?? null,
    shipping_price: parseFloat(formData.get("shipping_price") as string),
    min_delivery_days: parseInt((formData.get("min_delivery_days") as string) || "0"),
    max_delivery_days: parseInt((formData.get("max_delivery_days") as string) || "0"),
    id: parsedId && !isNaN(parsedId) && parsedId > 0 ? parsedId : undefined,
  };

  if (!data.country_code || isNaN(data.shipping_price)) {
    return { success: false, message: "Country code and shipping price are required." };
  }
  if (data.shipping_price <= 0) {
    return { success: false, message: "Shipping price must be greater than zero." };
  }
  if (data.min_delivery_days < 0 || data.max_delivery_days < 0) {
    return { success: false, message: "Delivery days must be positive numbers." };
  }
  if (data.min_delivery_days > data.max_delivery_days) {
    return {
      success: false,
      message: "Minimum delivery days cannot be greater than maximum delivery days.",
    };
  }

  const payload = {
    countryCode: data.country_code.toUpperCase(),
    countryName: data.country_name,
    shippingPrice: String(data.shipping_price),
    minDeliveryDays: data.min_delivery_days,
    maxDeliveryDays: data.max_delivery_days,
    updatedAt: new Date(),
  };

  try {
    if (data.id) {
      await db
        .update(countryShippingPrices)
        .set(payload)
        .where(eq(countryShippingPrices.id, data.id));
    } else {
      await db.insert(countryShippingPrices).values(payload);
    }
    revalidatePath("/admin/shipping-prices");
    return { success: true, message: "Shipping price saved successfully!" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Failed to save shipping price: ${message}` };
  }
}

export async function updateDefaultShippingPrice(price: number): Promise<ShippingActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized." };
  }

  try {
    await db
      .insert(appSettings)
      .values({ key: "default_shipping_price", value: price.toString() })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value: sql`EXCLUDED.value` },
      });
    revalidatePath("/admin/shipping-prices");
    return { success: true, message: "Default shipping price updated successfully!" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Failed to update default price: ${message}` };
  }
}
