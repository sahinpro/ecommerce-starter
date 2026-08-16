import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { BenefitsSection } from '@/features/storefront/components/home/benefits-section';
import { CategoryTilesSection } from '@/features/storefront/components/home/category-tiles-section';
import { EditorialSection } from '@/features/storefront/components/home/editorial-section';
import { FeaturedProductsSection } from '@/features/storefront/components/home/featured-products-section';
import { HeroSection } from '@/features/storefront/components/home/hero-section';
import { JournalSection } from '@/features/storefront/components/home/journal-section';
import { featuredProductsQueryOptions } from '@/features/storefront/api/queries';
import { getQueryClient } from '@/lib/query-client';

export const metadata = {
  title: 'Sukoon | Premium Cloth Brand',
  description: 'Premium cloth from Dhaka. Crafted in Bangladesh. Made for here.'
};

export default function HomePage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(featuredProductsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HeroSection />
      <CategoryTilesSection />
      <EditorialSection />
      <Suspense fallback={<div className='px-10 py-16'>Loading products…</div>}>
        <FeaturedProductsSection />
      </Suspense>
      <JournalSection />
      <BenefitsSection />
    </HydrationBoundary>
  );
}
