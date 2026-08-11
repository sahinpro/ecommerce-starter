'use client';

import Link from 'next/link';
import { useSuspenseQuery } from '@tanstack/react-query';

import { featuredProductsQueryOptions } from '../../api/queries';
import { ProductCard } from '../product/product-card';

export function FeaturedProductsSection() {
  const { data: products } = useSuspenseQuery(featuredProductsQueryOptions());

  return (
    <section className='px-10 py-16'>
      <div className='mb-8 flex items-end justify-between'>
        <h2 className='font-serif text-2xl'>New Arrivals</h2>
        <Link href='/shop?category=new-arrivals' className='text-sm underline-offset-4 hover:underline'>
          View all
        </Link>
      </div>
      <div className='grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4'>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
