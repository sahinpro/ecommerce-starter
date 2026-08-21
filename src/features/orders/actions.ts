'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { allowCheckout, CHECKOUT_RATE_LIMIT_MESSAGE } from '@/lib/rate-limit';

import { placeCodOrderSchema } from './schemas/checkout';
import { storeSettingsSchema } from './schemas/settings';
import { isOrderStatus, type OrderStatus } from './constants';
import { deleteOrders, placeCodOrder, updateOrderStatus, updateStoreSettings } from './service';
import type { PlaceCodOrderResult, StoreSettings } from './types';

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function placeCodOrderAction(
  raw: unknown
): Promise<ActionResult<PlaceCodOrderResult>> {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!allowCheckout(ip)) {
    return { ok: false, error: CHECKOUT_RATE_LIMIT_MESSAGE };
  }

  const parsed = placeCodOrderSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? 'Invalid checkout data';
    return { ok: false, error: first };
  }

  try {
    const data = await placeCodOrder({
      customer_name: parsed.data.customer_name,
      customer_phone: parsed.data.customer_phone,
      address: parsed.data.address,
      shipping_area: parsed.data.shipping_area,
      items: parsed.data.items
    });
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not place order'
    };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: string
): Promise<ActionResult<{ id: string; order_status: string; payment_status: string }>> {
  if (!isOrderStatus(status)) {
    return { ok: false, error: 'Invalid order status' };
  }

  try {
    const order = await updateOrderStatus(orderId, status as OrderStatus);
    return {
      ok: true,
      data: {
        id: order.id,
        order_status: order.order_status,
        payment_status: order.payment_status
      }
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not update order'
    };
  }
}

const ORDER_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function deleteOrdersAction(
  ids: string[]
): Promise<ActionResult<{ deleted: number }>> {
  if (!Array.isArray(ids)) {
    return { ok: false, error: 'No orders selected' };
  }

  const unique = Array.from(
    new Set(ids.filter((id): id is string => typeof id === 'string' && ORDER_ID_RE.test(id)))
  );

  if (unique.length === 0) {
    return { ok: false, error: 'No orders selected' };
  }
  if (unique.length > 50) {
    return { ok: false, error: 'Select up to 50 orders at a time' };
  }

  try {
    const data = await deleteOrders(unique);
    revalidatePath('/dashboard/orders');
    unique.forEach((id) => revalidatePath(`/dashboard/orders/${id}`));
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not delete orders'
    };
  }
}

export async function updateStoreSettingsAction(
  raw: unknown
): Promise<ActionResult<StoreSettings>> {
  const parsed = storeSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? 'Invalid settings';
    return { ok: false, error: first };
  }

  try {
    const data = await updateStoreSettings(parsed.data);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not update settings'
    };
  }
}
