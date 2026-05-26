import React from "react";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/authz";
import {
  deleteShippingPriceAction,
  updateDefaultShippingPrice,
  upsertShippingPriceAction,
} from "@/lib/actions/shippingPricesActions";
import {
  getCountryShippingPrices,
  getDefaultShippingPrice,
} from "@/lib/helpers/shippingHelpers";
import ShippingPricesPageClient from "@/components/admin/shipping/ShippingPricesPageClient";

export { getShippingPriceForCountry } from "@/lib/helpers/shippingHelpers";
export const dynamic = "force-dynamic";

export default async function ShippingPricesPageWrapper() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const [initialPrices, defaultPrice] = await Promise.all([
    getCountryShippingPrices(),
    getDefaultShippingPrice(),
  ]);

  return (
    <ShippingPricesPageClient
      initialPrices={initialPrices}
      defaultPrice={defaultPrice}
      upsertAction={upsertShippingPriceAction}
      deleteAction={deleteShippingPriceAction}
      updateDefaultAction={updateDefaultShippingPrice}
    />
  );
}
