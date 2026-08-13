import type { NavPrimaryItem } from './types';
import { FIGMA_ABOUT_NAV, FIGMA_PRIMARY_CATEGORIES } from './figma-taxonomy';

/**
 * Static primary nav blueprint from client collections
 * (Palestine · Sukoon · Sabr · Tawakkul · Brotherhood + About).
 * Prefer `buildPrimaryNav(categories)` at runtime so Supabase remains the
 * live source of which categories exist — this constant is the client map.
 */
export const PRIMARY_NAV: NavPrimaryItem[] = [
  ...FIGMA_PRIMARY_CATEGORIES.map((item) => ({
    label: item.name,
    href: item.href,
    categorySlug: item.slug
  })),
  FIGMA_ABOUT_NAV
];

export const PRODUCT_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' }
] as const;

export const PRODUCT_BADGE_OPTIONS = [
  { label: 'None', value: '' },
  { label: 'New', value: 'new' },
  { label: 'Best seller', value: 'best_seller' },
  { label: 'Back in stock', value: 'back_in_stock' },
  { label: 'Sale', value: 'sale' }
] as const;
