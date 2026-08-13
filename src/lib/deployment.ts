/**
 * Production deployment foundation (approved architecture).
 *
 * Deploy as ONE Next.js project on Vercel:
 *   - Storefront (public/guest)
 *   - Dashboard (Supabase Auth admins)
 *   - Shared Supabase project (Database + Auth)
 *   - Cloudinary later for media (not Supabase Storage)
 *
 * Do not split storefront and dashboard into separate Vercel projects.
 */

export const DEPLOYMENT = {
  platform: 'vercel',
  appModel: 'single-nextjs-project',
  authProvider: 'supabase-auth-admin-only',
  mediaProvider: 'cloudinary',
  storefrontCommerce: 'localStorage-cart-wishlist'
} as const;
