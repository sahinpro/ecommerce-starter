'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

import { useThemeConfig } from './active-theme';
import { DEFAULT_THEME, STOREFRONT_THEME } from './theme.config';

function readColorMode(): 'light' | 'dark' | null {
  if (typeof document === 'undefined') return null;
  if (document.documentElement.classList.contains('dark')) return 'dark';
  if (document.documentElement.classList.contains('light')) return 'light';

  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore
  }

  return null;
}

/**
 * Keeps the public storefront on Sukoon tokens without exposing Sukoon
 * in the dashboard theme gallery. Restores the previous color mode when leaving.
 */
export function StorefrontTheme() {
  const { setTheme } = useTheme();
  const { setActiveTheme } = useThemeConfig();
  const previousModeRef = useRef<'light' | 'dark' | null>(null);
  const previousThemeRef = useRef<string | null>(null);

  useEffect(() => {
    previousModeRef.current = readColorMode();
    previousThemeRef.current = document.documentElement.getAttribute('data-theme');

    setActiveTheme(STOREFRONT_THEME);
    document.documentElement.setAttribute('data-theme', STOREFRONT_THEME);
    document.documentElement.classList.add('storefront-theme');
    document.documentElement.classList.remove('dashboard-theme');
    setTheme('light');

    return () => {
      document.documentElement.classList.remove('storefront-theme');

      const restoreTheme = previousThemeRef.current || DEFAULT_THEME;
      document.documentElement.setAttribute('data-theme', restoreTheme);

      if (previousModeRef.current) {
        setTheme(previousModeRef.current);
      }
    };
  }, [setActiveTheme, setTheme]);

  return null;
}
