'use client';

import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import type { Product } from '../../api/types';
import { PRODUCT_IMAGE_FALLBACK } from '../../constants/product-image';
import { formatPrice } from '../../utils/format-price';
import { ColorSwatches } from './color-swatches';
import { ProductBadgeLabel } from './product-badge';

type ProductCardProps = {
  product: Product;
  className?: string;
  catalogue?: boolean;
};

export function ProductCard({ product, className, catalogue = false }: ProductCardProps) {
  const primaryUrl = product.images[0]?.url?.trim();
  const secondaryUrl = product.images[1]?.url?.trim();
  const imageSrc = primaryUrl || PRODUCT_IMAGE_FALLBACK;
  const imageAlt = product.images[0]?.alt ?? product.name;
  const hasHoverSwap = Boolean(primaryUrl && secondaryUrl);

  return (
    <article className={cn('group', className)}>
      <Link href={`/product/${product.slug}`} className='relative block overflow-hidden'>
        <div
          className={cn(
            'bg-muted relative aspect-477/636 w-full overflow-hidden md:h-159 md:aspect-auto',
            catalogue && 'aspect-477/718 md:h-auto md:aspect-477/718'
          )}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
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
              src={secondaryUrl!}
              alt={product.images[1]?.alt ?? product.name}
              fill
              className='object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-md:hidden'
              sizes='(max-width: 768px) 50vw, 25vw'
            />
          ) : null}
          {product.badge ? <ProductBadgeLabel badge={product.badge} /> : null}
        </div>
      </Link>

      <div className='mt-4 flex items-start justify-between gap-3 px-4'>
        <Link
          href={`/product/${product.slug}`}
          className='hover:text-foreground/70 min-w-0 text-[14px] leading-4.5 tracking-[0.42px] uppercase transition-colors'
        >
          {product.name}
        </Link>
        <div className='shrink-0 text-right text-[14px] leading-4.5 tracking-[0.42px] uppercase'>
          {product.compare_at_price ? (
            <p className='text-muted-foreground text-xs line-through'>
              {formatPrice(product.compare_at_price)}
            </p>
          ) : null}
          <p>{formatPrice(product.price)}</p>
        </div>
      </div>
      <div className='mt-2 flex items-center justify-between gap-3 px-4'>
        <ColorSwatches colors={product.colors} shape='square' />
        {product.sizes.length > 0 ? (
          <ul className='flex gap-2 text-[11px] leading-none tracking-[0.22px] uppercase opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100'>
            {product.sizes.map((size) => {
              const inStock =
                product.variants.length === 0 ||
                product.variants.some(
                  (variant) => variant.size === size && variant.stock_quantity > 0
                );

              return (
                <li key={size} className={inStock ? 'text-sukoon-black' : 'text-sukoon-black/30'}>
                  {size}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
