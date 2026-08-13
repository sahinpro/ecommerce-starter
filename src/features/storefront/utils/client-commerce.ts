/**
 * Guest commerce foundation (approved).
 *
 * - Cart / wishlist: Zustand + localStorage (no customer auth)
 * - Checkout: server action → Supabase COD order + atomic stock decrement
 * - Single Next.js deploy on Vercel (storefront + dashboard)
 */

export const CLIENT_COMMERCE = {
  cartStorageKey: 'sukoon-cart',
  wishlistStorageKey: 'sukoon-wishlist',
  /** Bump when persisted shape changes; Zustand migrate handles upgrades. */
  storageVersion: 1
} as const;
