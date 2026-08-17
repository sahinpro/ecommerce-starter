import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { FIGMA_PRIMARY_CATEGORIES } from '@/features/catalog/figma-taxonomy';
import { categoryQueryOptions, productsQueryOptions } from '@/features/storefront/api/queries';
import { getCategories, getCategoryBySlug } from '@/features/storefront/api/service';
import {
  ShopListing,
  ShopListingSkeleton
} from '@/features/storefront/components/shop/shop-listing';
import { getQueryClient } from '@/lib/query-client';

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    if (categories.length > 0) {
      return categories.map((item) => ({ category: item.slug }));
    }
  } catch {
    // Build without Supabase still prerenders the known collections.
  }

  return FIGMA_PRIMARY_CATEGORIES.map((item) => ({ category: item.slug }));
}

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
  void queryClient.prefetchQuery(productsQueryOptions({ category, limit: 24 }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ShopListingSkeleton />}>
        <ShopListing category={category} title={categoryData.name} />
      </Suspense>
    </HydrationBoundary>
  );
}
