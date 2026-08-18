import 'server-only';

import { requireAdminUser } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

import type { OrderStatus } from './constants';
import { isOrderStatus } from './constants';
import type {
  GuestCustomer,
  Order,
  OrderFilters,
  OrderItem,
  OrdersListResponse,
  PlaceCodOrderInput,
  PlaceCodOrderResult,
  StoreSettings
} from './types';

function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function mapOrderItem(row: Record<string, unknown>): OrderItem {
  const price = num(row.price_snapshot ?? row.price);
  const quantity = num(row.quantity);
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    product_id: (row.product_id as string | null) ?? null,
    variant_id: (row.variant_id as string | null) ?? null,
    product_name_snapshot: String(row.product_name_snapshot ?? row.product_name ?? 'Product'),
    sku_snapshot: (row.sku_snapshot as string | null) ?? null,
    size_snapshot: (row.size_snapshot as string | null) ?? (row.size as string | null) ?? null,
    color_snapshot: (row.color_snapshot as string | null) ?? (row.color as string | null) ?? null,
    price_snapshot: price,
    quantity,
    line_total: num(row.line_total ?? price * quantity)
  };
}

function mapOrder(row: Record<string, unknown>, items?: OrderItem[]): Order {
  return {
    id: String(row.id),
    order_number: String(row.order_number ?? ''),
    customer_name: String(row.customer_name ?? ''),
    customer_phone: String(row.customer_phone ?? ''),
    customer_email: (row.customer_email as string | null) ?? null,
    address: String(row.address ?? ''),
    shipping_area: (row.shipping_area as string | null) ?? null,
    area: (row.area as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    postal_code: (row.postal_code as string | null) ?? null,
    country: String(row.country ?? 'Bangladesh'),
    subtotal: num(row.subtotal),
    shipping_cost: num(row.shipping_cost ?? row.shipping),
    total: num(row.total),
    currency: String(row.currency ?? 'BDT'),
    payment_method: String(row.payment_method ?? 'cod'),
    payment_status: String(row.payment_status ?? 'pending'),
    order_status: String(row.order_status ?? row.status ?? 'pending'),
    stock_restored: Boolean(row.stock_restored),
    notes: (row.notes as string | null) ?? null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? row.created_at ?? ''),
    items
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('store_settings')
    .select('shipping_cost, free_shipping_threshold, currency, country, low_stock_threshold')
    .eq('id', 1)
    .maybeSingle();

  if (error || !data) {
    return {
      shipping_cost: 80,
      free_shipping_threshold: 5000,
      currency: 'BDT',
      country: 'Bangladesh',
      low_stock_threshold: 5
    };
  }

  const row = data as Record<string, unknown>;
  return {
    shipping_cost: num(row.shipping_cost),
    free_shipping_threshold:
      row.free_shipping_threshold == null ? null : num(row.free_shipping_threshold),
    currency: String(row.currency ?? 'BDT'),
    country: String(row.country ?? 'Bangladesh'),
    low_stock_threshold: num(row.low_stock_threshold) || 5
  };
}

export async function updateStoreSettings(
  input: Partial<
    Pick<StoreSettings, 'shipping_cost' | 'free_shipping_threshold' | 'low_stock_threshold'>
  >
): Promise<StoreSettings> {
  await requireAdminUser();
  const supabase = await createSupabaseServerClient();

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };
  if (input.shipping_cost != null) payload.shipping_cost = input.shipping_cost;
  if (input.free_shipping_threshold !== undefined) {
    payload.free_shipping_threshold = input.free_shipping_threshold;
  }
  if (input.low_stock_threshold != null) payload.low_stock_threshold = input.low_stock_threshold;

  const { error } = await supabase.from('store_settings').update(payload).eq('id', 1);
  if (error) throw new Error(error.message);

  return getStoreSettings();
}

export async function placeCodOrder(input: PlaceCodOrderInput): Promise<PlaceCodOrderResult> {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.rpc('place_cod_order', {
    p_customer_name: input.customer_name,
    p_customer_phone: input.customer_phone,
    p_address: input.address,
    p_shipping_area: input.shipping_area,
    p_items: input.items
  });

  if (error) {
    const message = error.message || 'Could not place order';
    if (message.includes('Sorry, only')) {
      throw new Error(message);
    }
    if (message.includes('INSUFFICIENT_STOCK')) {
      const available = message.split(':')[1];
      throw new Error(
        available
          ? `Sorry, only ${available} items are available.`
          : 'Sorry, this item is out of stock.'
      );
    }
    throw new Error(message);
  }

  const result = data as PlaceCodOrderResult;
  if (!result?.order_number) {
    throw new Error('Order was created but confirmation data is missing.');
  }
  return result;
}

export async function listOrders(filters: OrderFilters = {}): Promise<OrdersListResponse> {
  await requireAdminUser();
  const supabase = await createSupabaseServerClient();

  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('orders')
    .select(
      'id, order_number, customer_name, customer_phone, customer_email, address, shipping_area, area, city, postal_code, country, subtotal, shipping_cost, shipping, total, currency, payment_method, payment_status, order_status, status, stock_restored, notes, created_at, updated_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.status && filters.status !== 'all' && isOrderStatus(filters.status)) {
    query = query.eq('order_status', filters.status);
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    query = query.or(
      `order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`
    );
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return {
    items: (data ?? []).map((row) => mapOrder(row as Record<string, unknown>)),
    total_items: count ?? 0
  };
}

/**
 * Guest customers from COD orders — unique by phone.
 * Name/address come from the most recent order for that phone.
 */
export async function listGuestCustomers(): Promise<GuestCustomer[]> {
  await requireAdminUser();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, customer_phone, address, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    throw new Error(error.message);
  }

  const byPhone = new Map<string, GuestCustomer>();

  for (const row of data ?? []) {
    const record = row as Record<string, unknown>;
    const phone = String(record.customer_phone ?? '').trim();
    if (!phone) continue;

    const key = phone.replace(/\s+/g, '');
    const existing = byPhone.get(key);

    if (!existing) {
      byPhone.set(key, {
        phone,
        full_name: String(record.customer_name ?? '').trim() || 'Guest',
        address: String(record.address ?? '').trim(),
        order_count: 1,
        last_order_id: String(record.id),
        last_order_number: String(record.order_number ?? ''),
        last_ordered_at: String(record.created_at ?? '')
      });
      continue;
    }

    existing.order_count += 1;
  }

  return Array.from(byPhone.values());
}

export async function getOrderById(id: string): Promise<Order | null> {
  await requireAdminUser();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, order_number, customer_name, customer_phone, customer_email, address, shipping_area, area, city, postal_code, country, subtotal, shipping_cost, shipping, total, currency, payment_method, payment_status, order_status, status, stock_restored, notes, created_at, updated_at'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select(
      'id, order_id, product_id, variant_id, product_name, product_name_snapshot, sku_snapshot, size, size_snapshot, color, color_snapshot, price, price_snapshot, quantity, line_total'
    )
    .eq('order_id', id);

  if (itemsError) throw new Error(itemsError.message);

  return mapOrder(
    data as Record<string, unknown>,
    (items ?? []).map((item) => mapOrderItem(item as Record<string, unknown>))
  );
}

export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus): Promise<Order> {
  await requireAdminUser();

  if (nextStatus === 'cancelled') {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.rpc('cancel_order_and_restore_stock', {
      p_order_id: orderId
    });
    if (error) throw new Error(error.message);
    const order = await getOrderById(orderId);
    if (!order) throw new Error('Order not found');
    return order;
  }

  const supabase = await createSupabaseServerClient();
  const payment_status = nextStatus === 'delivered' ? 'paid' : undefined;

  const payload: Record<string, unknown> = {
    order_status: nextStatus,
    status: nextStatus,
    updated_at: new Date().toISOString()
  };
  if (payment_status) {
    payload.payment_status = payment_status;
  }

  const { error } = await supabase.from('orders').update(payload).eq('id', orderId);
  if (error) throw new Error(error.message);

  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');
  return order;
}
