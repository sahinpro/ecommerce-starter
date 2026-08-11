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
  const image = product.images[0];

  return (
    <article className={cn('group', className)}>
      <Link href={`/product/${product.slug}`} className='relative block overflow-hidden'>
        <div
          className={cn(
            'bg-muted relative aspect-[477/636] w-full overflow-hidden',
            catalogue && 'aspect-[477/718]'
          )}
        >
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className='object-cover transition-transform duration-700 group-hover:scale-[1.02]'
              sizes='(max-width: 768px) 50vw, 25vw'
            />
          ) : null}
          <ProductBadgeLabel badge={product.badge} />
        </div>
      </Link>

      <div className='mt-4 flex items-start justify-between gap-3 px-1'>
        <div className='min-w-0 space-y-2'>
          <Link
            href={`/product/${product.slug}`}
            className='hover:text-foreground/70 block text-sm leading-snug transition-colors'
          >
            {product.name}
          </Link>
          <ColorSwatches colors={product.colors} />
        </div>
        <div className='shrink-0 text-right text-sm'>
          {product.compare_at_price ? (
            <p className='text-muted-foreground text-xs line-through'>
              {formatPrice(product.compare_at_price)}
            </p>
          ) : null}
          <p>{formatPrice(product.price)}</p>
        </div>
      </div>
    </article>
  );
}
