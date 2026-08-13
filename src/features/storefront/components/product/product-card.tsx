'use client';

import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import type { Product } from '../../api/types';
import { formatPrice } from '../../utils/format-price';
import { ColorSwatches } from './color-swatches';
import { ProductBadgeLabel } from './product-badge';

type ProductCardProps = {
  product: Product;
  className?: string;
  catalogue?: boolean;
};

export function ProductCard({ product, className, catalogue = false }: ProductCardProps) {
  const primary = product.images[0];
  const secondary = product.images[1];
  const hasHoverSwap = Boolean(primary && secondary);

  return (
    <article className={cn('group', className)}>
      <Link href={`/product/${product.slug}`} className='relative block overflow-hidden'>
        <div
          className={cn(
            'bg-muted relative aspect-[477/636] w-full overflow-hidden md:h-[636px] md:aspect-auto',
            catalogue && 'aspect-[477/718] md:h-auto md:aspect-[477/718]'
          )}
        >
          {primary ? (
            <>
              <Image
                src={primary.url}
                alt={primary.alt ?? product.name}
                fill
                className={cn(
                  'object-cover object-center transition-opacity duration-500',
                  hasHoverSwap
                    ? 'opacity-100 group-hover:opacity-0'
                    : 'transition-transform duration-700 group-hover:scale-[1.01]'
                )}
                sizes='(max-width: 768px) 50vw, 25vw'
              />
              {hasHoverSwap ? (
                <Image
                  src={secondary!.url}
                  alt={secondary!.alt ?? product.name}
                  fill
                  className='object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-md:hidden'
                  sizes='(max-width: 768px) 50vw, 25vw'
                />
              ) : null}
            </>
          ) : null}
          {product.badge ? <ProductBadgeLabel badge={product.badge} /> : null}
        </div>
      </Link>

      <div className='mt-[16px] flex items-start justify-between gap-3 px-4'>
        <Link
          href={`/product/${product.slug}`}
          className='hover:text-foreground/70 min-w-0 text-[14px] leading-[18px] tracking-[0.42px] uppercase transition-colors'
        >
          {product.name}
        </Link>
        <div className='shrink-0 text-right text-[14px] leading-[18px] tracking-[0.42px] uppercase'>
          {product.compare_at_price ? (
            <p className='text-muted-foreground text-xs line-through'>
              {formatPrice(product.compare_at_price)}
            </p>
          ) : null}
          <p>{formatPrice(product.price)}</p>
        </div>
      </div>
      <div className='mt-2 px-4'>
        <ColorSwatches colors={product.colors} shape='square' />
      </div>
    </article>
  );
}
