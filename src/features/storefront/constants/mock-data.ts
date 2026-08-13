import type { Benefit, CollectionTile, Story } from '../api/types';

/**
 * CMS / marketing PLACEHOLDERS only.
 *
 * NOT the product catalog. Catalog comes from Supabase via `@/features/catalog`.
 * Homepage hero/editorial/benefits still use temporary cashmere-era template copy.
 * Replace in a dedicated content phase — do not treat as client-final messaging.
 */

export const STORE_ANNOUNCEMENT = 'Founded in Bangladesh. Loved Worldwide.';

export const collectionTiles: CollectionTile[] = [
  {
    id: 'tile-1',
    title: 'Palestine',
    image_url: '/sukoon/home/tile-fine-cashmere-tee.png',
    href: '/shop/palestine',
    cta: 'Shop Now'
  },
  {
    id: 'tile-2',
    title: 'Sukoon',
    image_url: '/sukoon/home/tile-pointelle-tank.png',
    href: '/shop/sukoon',
    cta: 'Shop Now'
  },
  {
    id: 'tile-3',
    title: 'Sabr',
    image_url: '/sukoon/home/tile-vneck-camisole.png',
    href: '/shop/sabr',
    cta: 'Shop Now'
  }
];

export const stories: Story[] = [
  {
    id: 'story-1',
    slug: 'from-bangladesh-with-care',
    title: 'From Bangladesh, With Care',
    excerpt:
      'Every piece begins with thoughtful craft—soft fibres, patient hands, and a slower way of dressing.',
    image_url: '/sukoon/home/journal.png',
    link_text: 'Read More'
  }
];

export const benefits: Benefit[] = [
  {
    id: 'benefit-1',
    title: 'Up to eight times warmer than wool.',
    image_url: '/sukoon/home/benefit-1.png'
  },
  {
    id: 'benefit-2',
    title: 'Naturally insulating and moisture wicking.',
    image_url: '/sukoon/home/benefit-2.png'
  },
  {
    id: 'benefit-3',
    title: 'Timeless pieces to be treasured for a lifetime.',
    image_url: '/sukoon/home/benefit-3.png'
  }
];

/** TEMPLATE — replace with client-approved hero (cashmere copy is not final). */
export const heroContent = {
  title: 'Cashmere, Even in July',
  subtitle: 'Shop Warm-Weather Cashmere',
  image_url: '/sukoon/home/hero.png',
  href: '/shop'
};

/** TEMPLATE — replace with client-approved editorial. */
export const editorialBlock = {
  text: 'Why Cashmere in Summer? A rare natural fibre, cashmere is moisture-wicking and temperature-regulating by nature—keeping you cool through the heat of the day and softly insulated when evenings dip.'
};
