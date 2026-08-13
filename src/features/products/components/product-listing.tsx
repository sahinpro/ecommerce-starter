import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/query-client';

import { categoriesQueryOptions } from '../api/queries';
import { ProductTable } from './product-tables';

export default function ProductListingPage() {
  const queryClient = getQueryClient();
  // Categories are public. Admin product rows need the browser auth session (staff RLS).
  void queryClient.prefetchQuery(categoriesQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductTable />
    </HydrationBoundary>
  );
}
