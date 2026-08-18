import { Suspense } from 'react';

import { StorefrontTheme } from '@/components/themes/storefront-theme';

import { StorefrontFooter } from './storefront-footer';
import { StorefrontHeader } from './storefront-header';

type StorefrontShellProps = {
  children: React.ReactNode;
};

export function StorefrontShell({ children }: StorefrontShellProps) {
  return (
    <div className='bg-background text-foreground relative min-h-screen font-sans'>
      <StorefrontTheme />
      <Suspense fallback={null}>
        <StorefrontHeader />
      </Suspense>
      <main>{children}</main>
      <Suspense fallback={null}>
        <StorefrontFooter />
      </Suspense>
    </div>
  );
}
