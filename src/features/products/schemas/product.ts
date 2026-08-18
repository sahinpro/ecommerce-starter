import { z } from 'zod';

import {
  productBadgeSchema,
  productMutationSchema,
  productStatusSchema
} from '@/features/catalog/schemas/product';
import { postgresUuidSchema } from '@/lib/postgres-uuid';

const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(160, 'Slug is too long')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only');

/** Dashboard create/edit form values (badge '' = none). */
export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  slug: slugSchema,
  sku: z.string().trim().min(1, 'SKU is required').max(80),
  description: z.string().trim().max(10000),
  category_id: z.union([postgresUuidSchema('Select a category'), z.literal('')]),
  product_type: z.string().trim().max(80),
  badge: z.union([productBadgeSchema, z.literal('')]),
  featured: z.boolean(),
  status: productStatusSchema,
  price: z
    .number({ message: 'Price is required' })
    .finite()
    .nonnegative('Price must be zero or greater'),
  compare_at_price: z.union([z.number().finite().nonnegative(), z.literal(''), z.null()]),
  composition: z.string().trim().max(2000),
  care: z.string().trim().max(2000),
  size_fit: z.string().trim().max(2000)
});

export type ProductFormValues = z.input<typeof productFormSchema>;

export { productMutationSchema, productStatusSchema, productBadgeSchema };
