import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { FIGMA_PRIMARY_CATEGORIES } from '@/features/catalog/figma-taxonomy';
import { productsQueryOptions } from '@/features/storefront/api/queries';
import { ShopListing } from '@/features/storefront/components/shop/shop-listing';
import { getQueryClient } from '@/lib/query-client';

export const metadata = {
  title: 'Shop All | Sukoon'
};

type ShopPageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, q } = await searchParams;
  const search = q?.trim() || undefined;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    productsQueryOptions({
      category: category ?? undefined,
      search,
      limit: 24
    })
  );

  const known = FIGMA_PRIMARY_CATEGORIES.find((item) => item.slug === category);
  const title = search
    ? `Results for “${search}”`
    : (known?.name ?? (category ? category.replace(/-/g, ' ') : 'Shop All'));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div className='px-10 py-16'>Loading shop…</div>}>
        <ShopListing category={category} title={title} />
      </Suspense>
    </HydrationBoundary>
  );
}
