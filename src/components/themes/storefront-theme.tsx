'use client';

import { useEffect } from 'react';

import { useThemeConfig } from './active-theme';
import { DEFAULT_THEME, STOREFRONT_THEME } from './theme.config';

/**
 * Keeps the public storefront on Sukoon tokens without exposing Sukoon
 * in the dashboard theme gallery. Light/dark is forced via next-themes
 * `forcedTheme` on non-dashboard routes so this does not write localStorage.
 */
export function StorefrontTheme() {
  const { setActiveTheme } = useThemeConfig();

  useEffect(() => {
    setActiveTheme(STOREFRONT_THEME);
    document.documentElement.setAttribute('data-theme', STOREFRONT_THEME);
    document.documentElement.classList.add('storefront-theme');
    document.documentElement.classList.remove('dashboard-theme');

    return () => {
      document.documentElement.classList.remove('storefront-theme');
      document.documentElement.setAttribute('data-theme', DEFAULT_THEME);
    };
  }, [setActiveTheme]);

  return null;
}
