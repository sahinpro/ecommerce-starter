'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname();
  const forceLight = !pathname.startsWith('/dashboard') && !pathname.startsWith('/auth');

  return (
    <NextThemesProvider {...props} forcedTheme={forceLight ? 'light' : undefined}>
      {children}
    </NextThemesProvider>
  );
}
