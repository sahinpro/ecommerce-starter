import type { OrderStatus, PaymentMethod, PaymentStatus, ShippingArea } from './constants';

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name_snapshot: string;
  sku_snapshot: string | null;
  size_snapshot: string | null;
  color_snapshot: string | null;
  price_snapshot: number;
  quantity: number;
  line_total: number;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  /** Nullable historical field — not collected at checkout. */
  customer_email: string | null;
  address: string;
  shipping_area: ShippingArea | string | null;
  area: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  currency: string;
  payment_method: PaymentMethod | string;
  payment_status: PaymentStatus | string;
  order_status: OrderStatus | string;
  stock_restored: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type PlaceCodOrderItemInput = {
  variant_id: string;
  quantity: number;
};

export type PlaceCodOrderInput = {
  customer_name: string;
  customer_phone: string;
  address: string;
  shipping_area: ShippingArea;
  items: PlaceCodOrderItemInput[];
};

export type PlaceCodOrderResult = {
  id: string;
  order_number: string;
  subtotal: number;
  shipping_cost: number;
  shipping_area: ShippingArea | string;
  total: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  customer_phone: string;
  customer_name: string;
};

export type StoreSettings = {
  shipping_cost: number;
  free_shipping_threshold: number | null;
  currency: string;
  country: string;
  low_stock_threshold: number;
};

export type OrderFilters = {
  search?: string;
  status?: OrderStatus | 'all';
  page?: number;
  limit?: number;
};

export type OrdersListResponse = {
  items: Order[];
  total_items: number;
};

/** Guest buyer derived from COD orders (no customer accounts). */
export type GuestCustomer = {
  phone: string;
  full_name: string;
  address: string;
  order_count: number;
  last_order_id: string;
  last_order_number: string;
  last_ordered_at: string;
};
