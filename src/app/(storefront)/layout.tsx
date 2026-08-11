import { StorefrontShell } from '@/features/storefront/components/layout/storefront-shell';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return <StorefrontShell>{children}</StorefrontShell>;
}
