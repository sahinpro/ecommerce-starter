'use client';

import { useQuery } from '@tanstack/react-query';

import { Skeleton } from '@/components/ui/skeleton';

import { productsByIdsQueryOptions } from '../../api/queries';
import { useRecentlyViewedStore } from '../../utils/recently-viewed-store';
import { ProductCard } from '../product/product-card';

const SKELETON_COUNT = 4;

export function RecentlyViewedSection() {
  const productIds = useRecentlyViewedStore((s) => s.productIds);
  const hasHydrated = useRecentlyViewedStore((s) => s.hasHydrated);

  const { data: products = [], isPending } = useQuery({
    ...productsByIdsQueryOptions(productIds),
    enabled: hasHydrated && productIds.length > 0
  });

  if (!hasHydrated || productIds.length === 0) return null;
  if (!isPending && products.length === 0) return null;

  return (
    <section className='mx-auto max-w-container px-4 lg:px-6 pt-16 pb-20'>
      <h2 className='text-[15px] leading-4 font-bold tracking-[0.45px] uppercase'>
        Continue shopping with
      </h2>
      <div className='mt-8 grid grid-cols-2 gap-x-1 gap-y-10 lg:grid-cols-4'>
        {isPending
          ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <RecentlyViewedCardSkeleton key={index} />
            ))
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

function RecentlyViewedCardSkeleton() {
  return (
    <article aria-hidden>
      <Skeleton className='aspect-477/636 w-full rounded-none md:h-159 md:aspect-auto' />
      <div className='mt-4 flex items-start justify-between gap-3 pl-0 lg:px-4'>
        <Skeleton className='h-4 w-28 rounded-none' />
        <Skeleton className='h-4 w-14 rounded-none' />
      </div>
    </article>
  );
}
