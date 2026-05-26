"use server";

import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appSettings, countryShippingPrices } from "@/db/schema";
import { countryShippingPriceSelector } from "@/lib/db/selectors";
import { requireAdmin } from "@/lib/auth/authz";

export async function upsertShippingPriceAction(
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const countryCode = (formData.get("country_code") as string).toUpperCase();
    const countryName = formData.get("country_name") as string;
    const shippingPrice = parseFloat(formData.get("shipping_price") as string);
    const minDeliveryDays = formData.get("min_delivery_days")
      ? parseInt(formData.get("min_delivery_days") as string)
      : null;
    const maxDeliveryDays = formData.get("max_delivery_days")
      ? parseInt(formData.get("max_delivery_days") as string)
      : null;

    await db
      .insert(countryShippingPrices)
      .values({
        countryCode,
        countryName,
        shippingPrice: String(shippingPrice),
        minDeliveryDays: minDeliveryDays,
        maxDeliveryDays: maxDeliveryDays,
      })
      .onConflictDoUpdate({
        target: countryShippingPrices.countryCode,
        set: {
          countryName,
          shippingPrice: String(shippingPrice),
          minDeliveryDays,
          maxDeliveryDays,
          updatedAt: sql`now()`,
        },
      });

    revalidatePath("/admin/shipping-prices");
    return { success: true, message: "Shipping price updated successfully" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, message: `Failed to upsert shipping price: ${message}` };
  }
}

export async function deleteShippingPriceAction(
  id: number,
): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }
  try {
    await db.delete(countryShippingPrices).where(eq(countryShippingPrices.id, id));
    revalidatePath("/admin/shipping-prices");
    return { success: true, message: "Shipping price deleted successfully" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, message: `Failed to delete shipping price: ${message}` };
  }
}

export async function updateDefaultShippingPrice(
  price: number,
): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
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
    return { success: true, message: "Default shipping price updated successfully" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, message: `Failed to update default shipping price: ${message}` };
  }
}

export async function getCountryShippingPricesAction(): Promise<{
  success: boolean;
  data?: Array<Record<string, unknown>>;
  error?: string;
}> {
  try {
    const data = await db
      .select(countryShippingPriceSelector)
      .from(countryShippingPrices)
      .orderBy(asc(countryShippingPrices.countryName));
    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
