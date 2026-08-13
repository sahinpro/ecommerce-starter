import { z } from 'zod';

import { postgresUuidSchema } from '@/lib/postgres-uuid';

import { SHIPPING_AREAS } from '../constants';

const bdPhone = z
  .string()
  .trim()
  .min(10, 'Enter a valid Bangladesh phone number')
  .max(20, 'Phone number is too long')
  .regex(/^[0-9+\-\s()]+$/, 'Phone number can only include digits and + - ( )');

/** Postgres UUID shape (not RFC-strict) — seed IDs like 5555…5506 are valid in DB. */
const postgresUuid = postgresUuidSchema(
  'A cart item is invalid. Remove it and add the product again.'
);

const shippingAreaValues = SHIPPING_AREAS.map((area) => area.value) as [
  (typeof SHIPPING_AREAS)[number]['value'],
  ...(typeof SHIPPING_AREAS)[number]['value'][]
];

export const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, 'Full name is required').max(120),
  customer_phone: bdPhone,
  address: z.string().trim().min(5, 'Delivery address is required').max(500),
  shipping_area: z.enum(shippingAreaValues, {
    message: 'Shipping area is required'
  })
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const placeCodOrderSchema = checkoutSchema.extend({
  items: z
    .array(
      z.object({
        variant_id: postgresUuid,
        quantity: z.number().int().min(1).max(99)
      })
    )
    .min(1, 'Cart is empty')
});
