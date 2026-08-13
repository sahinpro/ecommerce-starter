import { z } from 'zod';

const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(120, 'Slug is too long')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only');

export const categoryMutationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  slug: slugSchema,
  image_url: z.string().trim().max(2000).nullable().optional(),
  image_public_id: z.string().trim().max(255).nullable().optional(),
  sort_order: z.number().int().min(0).optional()
});

export type CategoryMutationInput = z.infer<typeof categoryMutationSchema>;
