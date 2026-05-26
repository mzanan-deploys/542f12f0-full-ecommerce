export interface CountryShippingPrice {
  id?: number;
  country_code: string;
  country_name: string | null;
  shipping_price: number;
  min_delivery_days?: number | null;
  max_delivery_days?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ShippingPriceFormData {
    id?: number;
    country_code: string;
    country_name: string | null;
    shipping_price: number;
    min_delivery_days: number;
    max_delivery_days: number;
}

export interface ShippingActionResult {
    success: boolean;
    message: string;
} 