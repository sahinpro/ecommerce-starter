/**
 * Dashboard default theme (Shopify-style admin). Storefront uses Sukoon via
 * StorefrontTheme and is intentionally omitted from the dashboard theme gallery.
 */
export const DEFAULT_THEME = 'admin';
export const STOREFRONT_THEME = 'sukoon';

/** All valid `data-theme` values for cookie / SSR validation. */
export const VALID_THEMES = [DEFAULT_THEME, STOREFRONT_THEME] as const;

export type ValidTheme = (typeof VALID_THEMES)[number];

export function isValidTheme(value: string | undefined | null): value is ValidTheme {
  return !!value && (VALID_THEMES as readonly string[]).includes(value);
}
