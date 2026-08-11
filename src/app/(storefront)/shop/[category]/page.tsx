import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import {
  categoryQueryOptions,
  productsQueryOptions
} from '@/features/storefront/api/queries';
import { getCategoryBySlug } from '@/features/storefront/api/service';
import { ShopListing } from '@/features/storefront/components/shop/shop-listing';
import { getQueryClient } from '@/lib/query-client';

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const data = await getCategoryBySlug(category);
  return { title: data ? `${data.name} | Sukoon` : 'Shop | Sukoon' };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryData = await getCategoryBySlug(category);

  if (!categoryData) {
    notFound();
  }

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(categoryQueryOptions(category));
  void queryClient.prefetchQuery(
    productsQueryOptions({ category, limit: 24 })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div className='px-10 py-16'>Loading…</div>}>
        <ShopListing category={category} title={categoryData.name} />
      </Suspense>
    </HydrationBoundary>
  );
}
