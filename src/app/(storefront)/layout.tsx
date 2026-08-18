import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { StorefrontShell } from '@/features/storefront/components/layout/storefront-shell';
import { categoriesQueryOptions } from '@/features/storefront/api/queries';
import { resolvedNavQueryOptions } from '@/features/navigation/api/queries';
import { getQueryClient } from '@/lib/query-client';

/** Public catalog pages are prerendered and refreshed in the background. */
export const revalidate = 120;
export const fetchCache = 'force-cache';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(categoriesQueryOptions());
  await Promise.all([
    queryClient.prefetchQuery(resolvedNavQueryOptions('main-menu')),
    queryClient.prefetchQuery(resolvedNavQueryOptions('footer'))
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StorefrontShell>{children}</StorefrontShell>
    </HydrationBoundary>
  );
}
