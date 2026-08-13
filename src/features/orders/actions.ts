'use server';

import { placeCodOrderSchema } from './schemas/checkout';
import { isOrderStatus, type OrderStatus } from './constants';
import { placeCodOrder, updateOrderStatus } from './service';
import type { PlaceCodOrderResult } from './types';

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function placeCodOrderAction(
  raw: unknown
): Promise<ActionResult<PlaceCodOrderResult>> {
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
