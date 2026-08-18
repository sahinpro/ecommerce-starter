import { z } from 'zod';

import { postgresUuidSchema } from '@/lib/postgres-uuid';

const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(160, 'Slug is too long')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only');

const entityId = postgresUuidSchema('Invalid id');

export const productBadgeSchema = z.enum(['new', 'best_seller', 'back_in_stock', 'sale']);
export const productStatusSchema = z.enum(['active', 'draft', 'archived']);

export const productMutationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  slug: slugSchema,
  sku: z.string().trim().min(1, 'SKU is required').max(80),
  description: z.string().trim().max(10000).nullable().optional(),
  price: z.number().finite().nonnegative('Price must be zero or greater'),
  compare_at_price: z.number().finite().nonnegative().nullable().optional(),
  category_id: entityId.nullable().optional(),
  product_type: z.string().trim().max(80).nullable().optional(),
  badge: productBadgeSchema.nullable().optional(),
  featured: z.boolean().optional(),
  status: productStatusSchema.optional(),
  composition: z.string().trim().max(2000).nullable().optional(),
  care: z.string().trim().max(2000).nullable().optional(),
  size_fit: z.string().trim().max(2000).nullable().optional()
});

export const productImageMutationSchema = z.object({
  product_id: entityId,
  url: z.string().trim().min(1, 'A Cloudinary URL is required').max(2000),
  public_id: z.string().trim().max(255).nullable().optional(),
  alt: z.string().trim().max(255).nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
  media_asset_id: entityId.nullable().optional()
});

export const productVariantMutationSchema = z.object({
  product_id: entityId,
  sku: z.string().trim().max(80).optional(),
  size: z.string().trim().max(40).optional(),
  color_id: entityId.nullable().optional(),
  price: z.number().finite().nonnegative(),
  compare_at_price: z.number().finite().nonnegative().nullable().optional(),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative').optional(),
  barcode: z.string().trim().max(80).nullable().optional(),
  status: z.enum(['active', 'archived']).optional(),
  option_value_ids: z.array(entityId).max(3).optional(),
  variant_id: entityId.optional()
});

export const productOptionMutationSchema = z.object({
  product_id: entityId,
  name: z.string().trim().min(1).max(40),
  position: z.number().int().min(0).max(2).optional()
});

export const productOptionValueMutationSchema = z.object({
  option_id: entityId,
  name: z.string().trim().min(1).max(80),
  hex: z
    .union([
      z
        .string()
        .trim()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Hex must look like #C4B7A6'),
      z.null()
    ])
    .optional(),
  position: z.number().int().min(0).optional()
});

export type ProductMutationInput = z.infer<typeof productMutationSchema>;
export type ProductImageMutationInput = z.infer<typeof productImageMutationSchema>;
export type ProductVariantMutationInput = z.infer<typeof productVariantMutationSchema>;
