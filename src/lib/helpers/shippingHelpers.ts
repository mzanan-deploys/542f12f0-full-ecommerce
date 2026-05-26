import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { appSettings, countryShippingPrices } from "@/db/schema";
import { countryShippingPriceSelector } from "@/lib/db/selectors";
import type { CountryShippingPrice } from "@/types/shipping";

export async function getCountryShippingPrices(): Promise<CountryShippingPrice[]> {
  try {
    const data = await db
      .select(countryShippingPriceSelector)
      .from(countryShippingPrices)
      .orderBy(asc(countryShippingPrices.countryName));
    return data as unknown as CountryShippingPrice[];
  } catch (error) {
    console.error("[getCountryShippingPrices]", error);
    return [];
  }
}

export async function getDefaultShippingPrice(): Promise<number> {
  try {
    const [row] = await db
      .select({ value: appSettings.value })
      .from(appSettings)
      .where(eq(appSettings.key, "default_shipping_price"))
      .limit(1);
    if (row?.value) return parseFloat(row.value) || 10.0;
  } catch (error) {
    console.error("[getDefaultShippingPrice]", error);
  }
  return 10.0;
}

export async function getShippingPriceForCountry(countryCode: string): Promise<number> {
  try {
    const [row] = await db
      .select({ shippingPrice: countryShippingPrices.shippingPrice })
      .from(countryShippingPrices)
      .where(eq(countryShippingPrices.countryCode, countryCode.toUpperCase()))
      .limit(1);
    if (row?.shippingPrice) {
      const value = Number(row.shippingPrice);
      if (!Number.isNaN(value)) return value;
    }
  } catch (error) {
    console.error("[getShippingPriceForCountry]", error);
  }
  return getDefaultShippingPrice();
}
