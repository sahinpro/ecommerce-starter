export const LOW_STOCK_THRESHOLD = 5;

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
] as const;

export const PAYMENT_STATUSES = ['pending', 'paid', 'refunded'] as const;

export const PAYMENT_METHODS = ['cod'] as const;

export const DEFAULT_CURRENCY = 'BDT';
export const DEFAULT_COUNTRY = 'Bangladesh';

/** Fixed Bangladesh shipping zones — fees are server-derived only. */
export const SHIPPING_AREAS = [
  {
    value: 'dhaka_inside',
    label: 'Dhaka Inside',
    fee: 90
  },
  {
    value: 'dhaka_outside',
    label: 'Dhaka Outside',
    fee: 120
  }
] as const;

export type ShippingArea = (typeof SHIPPING_AREAS)[number]['value'];

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function isShippingArea(value: string): value is ShippingArea {
  return SHIPPING_AREAS.some((area) => area.value === value);
}

export function shippingFeeForArea(area: ShippingArea): number {
  const match = SHIPPING_AREAS.find((item) => item.value === area);
  return match?.fee ?? 0;
}

export function shippingAreaLabel(area: string | null | undefined): string {
  const match = SHIPPING_AREAS.find((item) => item.value === area);
  if (!match) return area || '—';
  return `${match.label} — ৳${match.fee}`;
}

export function stockStatusLabel(
  quantity: number,
  threshold = LOW_STOCK_THRESHOLD
): {
  label: string;
  tone: 'ok' | 'low' | 'out';
} {
  if (quantity <= 0) return { label: 'Out of stock', tone: 'out' };
  if (quantity <= threshold) return { label: 'Low stock', tone: 'low' };
  return { label: 'In stock', tone: 'ok' };
}
