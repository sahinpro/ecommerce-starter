import type { Category, NavPrimaryItem } from './types';

/**
 * Authoritative Sukoon catalog taxonomy — client collection export.
 *
 * Collections (primary nav):
 *   Palestine · Sukoon · Sabr · Tawakkul · Brotherhood
 *
 * Elle & Riley is interaction inspiration only — never content/branding.
 * About is a page link, not a category row.
 */

export const FIGMA_FILE_KEY = '9vLIUjShBT6xikhTmUqEuL' as const;

export const FIGMA_NODES = {
  header: '1:215',
  homepage: '1:84',
  footer: '1:173',
  plp: '1:326',
  filterDrawer: '1:590',
  pdp: '1:658',
  /** Client collection boards (authoritative product/collection source). */
  collections: ['13:92', '45:3506', '12:66'] as const
} as const;

export type PrimaryCollection = {
  slug: string;
  name: string;
  href: string;
  sort_order: number;
  /** Short export note shown in mega-menu secondary column. */
  blurb: string;
};

/** Top-level storefront collections from client export. */
export const FIGMA_PRIMARY_CATEGORIES: readonly PrimaryCollection[] = [
  {
    slug: 'palestine',
    name: 'Palestine',
    href: '/shop/palestine',
    sort_order: 1,
    blurb: 'Cream tee, “PALESTINE” + flag / Arabic back'
  },
  {
    slug: 'sukoon',
    name: 'Sukoon',
    href: '/shop/sukoon',
    sort_order: 2,
    blurb: 'Cream tee, “SUKOON” + “Seek peace within…”'
  },
  {
    slug: 'sabr',
    name: 'Sabr',
    href: '/shop/sabr',
    sort_order: 3,
    blurb: 'Black tee, chest “Sabr” / back صبر · PATIENCE'
  },
  {
    slug: 'tawakkul',
    name: 'Tawakkul',
    href: '/shop/tawakkul',
    sort_order: 4,
    blurb: 'Black tee, تَوَكَّل / TAWAKKUL + Quran 65:3 art'
  },
  {
    slug: 'brotherhood',
    name: 'Brotherhood',
    href: '/shop/brotherhood',
    sort_order: 5,
    blurb: 'Black tee, “BROTHERHOOD” / أخوة handshake art'
  }
] as const;

export const FIGMA_ABOUT_NAV: NavPrimaryItem = {
  label: 'About',
  href: '/about'
};

/** Footer Shop column — not a category hierarchy. */
export const FIGMA_FOOTER_SHOP_LINKS = [
  { label: 'Best Sellers', href: '/shop?sort=newest' },
  { label: 'Shop All', href: '/shop' }
] as const;

const figmaSlugOrder = new Map<string, number>(
  FIGMA_PRIMARY_CATEGORIES.map((item, index) => [item.slug, index])
);

const blurbBySlug = new Map(
  FIGMA_PRIMARY_CATEGORIES.map((item) => [item.slug, item.blurb] as const)
);

export function getCollectionBlurb(slug: string): string | undefined {
  return blurbBySlug.get(slug);
}

/**
 * Build primary nav from Supabase categories, ordered to match client collections.
 * Categories not present in the client list are omitted.
 */
export function buildPrimaryNav(categories: Category[]): NavPrimaryItem[] {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));

  const fromDb: NavPrimaryItem[] = FIGMA_PRIMARY_CATEGORIES.flatMap((figma) => {
    const row = bySlug.get(figma.slug);
    if (!row) return [];
    return [
      {
        label: row.name || figma.name,
        href: figma.href,
        categorySlug: figma.slug
      }
    ];
  });

  return [...fromDb, FIGMA_ABOUT_NAV];
}

export function figmaCategorySortIndex(slug: string): number {
  return figmaSlugOrder.get(slug) ?? Number.MAX_SAFE_INTEGER;
}
