import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { STOREFRONT_THEME } from '@/components/themes/theme.config';
import ThemeProvider from '@/components/themes/theme-provider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

const themeColorScript = `(function(){try{var p=location.pathname;if(p.indexOf('/dashboard')!==0&&p.indexOf('/auth')!==0)return;if(localStorage.theme==='dark'||((!('theme' in localStorage)||localStorage.theme==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.querySelector('meta[name="theme-color"]')?.setAttribute('content','${META_THEME_COLORS.dark}')}}catch(_){}})();`;

export const metadata: Metadata = {
  title: 'Sukoon | Premium Cloth Brand',
  description: 'Premium cloth from Dhaka. Crafted in Bangladesh. Made for here.'
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning data-theme={STOREFRONT_THEME}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeColorScript }} />
      </head>
      <body
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={STOREFRONT_THEME}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
