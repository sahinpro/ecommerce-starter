'use client';

import { useEffect } from 'react';

import { useThemeConfig } from './active-theme';
import { DEFAULT_THEME } from './theme.config';

/**
 * Scopes the admin shell to the WhatsApp theme tokens.
 * Light/dark mode is left to next-themes + ThemeModeToggle (starter behavior).
 */
export function DashboardTheme() {
  const { setActiveTheme } = useThemeConfig();

  useEffect(() => {
    setActiveTheme(DEFAULT_THEME);
    document.documentElement.setAttribute('data-theme', DEFAULT_THEME);
    document.documentElement.classList.add('dashboard-theme');
    document.documentElement.classList.remove('storefront-theme');

    return () => {
      document.documentElement.classList.remove('dashboard-theme');
    };
  }, [setActiveTheme]);

  return null;
}
