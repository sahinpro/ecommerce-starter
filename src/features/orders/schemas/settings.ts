import { z } from 'zod';

export const storeSettingsSchema = z.object({
  shipping_cost: z.coerce.number().finite().nonnegative('Shipping cost cannot be negative'),
  free_shipping_threshold: z.preprocess(
    (value) => (value === '' || value === undefined ? null : value),
    z.union([z.coerce.number().finite().nonnegative(), z.null()])
  ),
  low_stock_threshold: z.coerce.number().int().min(0, 'Cannot be negative')
});

export type StoreSettingsFormValues = z.input<typeof storeSettingsSchema>;
