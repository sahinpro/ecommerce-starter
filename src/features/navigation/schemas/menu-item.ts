import { z } from 'zod';

export const menuLinkTypeSchema = z.enum(['category', 'page', 'url']);

export const menuItemFormSchema = z
  .object({
    label: z.string().trim().min(1, 'Label is required').max(80),
    link_type: menuLinkTypeSchema,
    link_value: z.string().trim().min(1, 'Link is required').max(2000),
    blurb: z.string().trim().max(240).optional()
  })
  .superRefine((value, ctx) => {
    if (value.link_type === 'url') {
      const href = value.link_value;
      const ok = href.startsWith('/') || href.startsWith('http://') || href.startsWith('https://');
      if (!ok) {
        ctx.addIssue({
          code: 'custom',
          path: ['link_value'],
          message: 'Use a path like /shop or a full https URL'
        });
      }
    }
  });

export type MenuItemFormValues = z.input<typeof menuItemFormSchema>;
