'use client';

import Link from 'next/link';
import { useSuspenseQuery } from '@tanstack/react-query';

import { featuredProductsQueryOptions } from '../../api/queries';
import { ProductCard } from '../product/product-card';

export function FeaturedProductsSection() {
  const { data: products } = useSuspenseQuery(featuredProductsQueryOptions());

  return (
    <section className='overflow-hidden pb-14 md:min-h-214.25 md:pb-0' data-node-id='1:108'>
      <div className='flex items-center justify-end gap-3.25 px-10 pt-10 text-[13px] leading-3.25 tracking-[0.26px] md:pt-16'>
        <Link href='/shop' className='text-black transition-opacity hover:opacity-70'>
          Shop All
        </Link>
      </div>
      <div className='mt-6 grid grid-cols-2 gap-x-1 gap-y-10 md:mt-6 lg:grid-cols-4'>
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
