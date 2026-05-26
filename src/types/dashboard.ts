export interface OrderDetailItem {
  product_name: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price_at_purchase: number;
  product_size?: string | null;
  subtotal: number;
}

export interface OrderDetails {
  items: OrderDetailItem[];
  products_total_price: number;
  shipping_price: number;
  total_quantity: number;
}

export interface SaleOrder {
  id: string;
  created_at: string;
  shipping_status: 'pending' | 'in_transit' | 'delivered' | null;
  status: string;
  order_details: OrderDetails | OrderDetailItem[] | null;
  shipping_name: string | null;
  shipping_email: string | null;
  shipping_country: string | null;
  total_amount: number | null;
  user_id: string;
}

export interface DashboardSearchParams {
  page?: string | string[];
  sortBy?: string | string[];
  sortOrder?: string | string[];
}

export interface DashboardData {
  orders: SaleOrder[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  sortBy: string;
  sortOrder: string;
} 