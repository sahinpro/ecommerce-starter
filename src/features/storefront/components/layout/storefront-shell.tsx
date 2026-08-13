import { StorefrontTheme } from '@/components/themes/storefront-theme';

import { StorefrontFooter } from './storefront-footer';
import { StorefrontHeader } from './storefront-header';

type StorefrontShellProps = {
  children: React.ReactNode;
};

export function StorefrontShell({ children }: StorefrontShellProps) {
  return (
    <div className='bg-background text-foreground min-h-screen font-sans'>
      <StorefrontTheme />
      <StorefrontHeader />
      <main>{children}</main>
      <StorefrontFooter />
    </div>
  );
}
