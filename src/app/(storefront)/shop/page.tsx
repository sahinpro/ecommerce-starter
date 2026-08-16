import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { productsQueryOptions } from '@/features/storefront/api/queries';
import { ShopListing } from '@/features/storefront/components/shop/shop-listing';
import { getQueryClient } from '@/lib/query-client';

export const metadata = {
  title: 'Shop All | Sukoon'
};

export default function ShopPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(productsQueryOptions({ limit: 24 }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div className='px-10 py-16'>Loading shop…</div>}>
        <ShopListing title='Shop All' />
      </Suspense>
    </HydrationBoundary>
  );
}
