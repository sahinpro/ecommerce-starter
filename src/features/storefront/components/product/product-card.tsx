'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

import type { Product } from '../../api/types';
import { PRODUCT_IMAGE_FALLBACK } from '../../constants/product-image';
import { formatPrice } from '../../utils/format-price';
import { useWishlistStore } from '../../utils/wishlist-store';
import { ColorSwatches } from './color-swatches';
import { ProductBadgeLabel } from './product-badge';

type ProductCardProps = {
  product: Product;
  className?: string;
  catalogue?: boolean;
  preview?: boolean;
};

export function ProductCard({
  product,
  className,
  catalogue = false,
  preview = false
}: ProductCardProps) {
  const primaryUrl = product.images[0]?.url?.trim();
  const secondaryUrl = product.images[1]?.url?.trim();
  const imageSrc = primaryUrl || PRODUCT_IMAGE_FALLBACK;
  const imageAlt = product.images[0]?.alt ?? product.name;
  const hasHoverSwap = Boolean(primaryUrl && secondaryUrl);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const wishlistHydrated = useWishlistStore((state) => state.hasHydrated);
  const isWishlisted = useWishlistStore((state) => state.has(product.id));
  const wishlisted = preview || (wishlistHydrated && isWishlisted);

  const imageFrame = (
    <div
      className={cn(
        'bg-muted relative aspect-477/636 w-full overflow-hidden',
        !preview && 'md:h-159 md:aspect-auto',
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
        sizes={preview ? '320px' : '(max-width: 768px) 50vw, 25vw'}
      />
      {hasHoverSwap ? (
        <Image
          src={secondaryUrl!}
          alt={product.images[1]?.alt ?? product.name}
          fill
          className='object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-md:hidden'
          sizes={preview ? '320px' : '(max-width: 768px) 50vw, 25vw'}
        />
      ) : null}
      {product.badge ? <ProductBadgeLabel badge={product.badge} /> : null}
    </div>
  );

  return (
    <article className={cn('group', className)}>
      <div className='relative'>
        {preview ? (
          <div className='relative overflow-hidden'>{imageFrame}</div>
        ) : (
          <Link href={`/product/${product.slug}`} className='relative block overflow-hidden'>
            {imageFrame}
          </Link>
        )}
        <button
          type='button'
          disabled={preview}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!preview) toggleWishlist(product.id);
          }}
          aria-label={
            preview ? 'Wishlist' : wishlisted ? 'Remove from wishlist' : 'Add to wishlist'
          }
          aria-pressed={wishlisted}
          className={cn(
            'absolute top-2 right-2 z-10 flex size-10 items-center justify-center transition-opacity',
            preview
              ? 'cursor-default opacity-100'
              : 'cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100'
          )}
        >
          <Icons.heart
            className={cn('size-4 text-sukoon-black', wishlisted && 'fill-black text-black')}
          />
        </button>
      </div>

      <div className={cn('mt-4 flex items-start justify-between gap-3', !preview && 'px-4')}>
        {preview ? (
          <p className='min-w-0 text-[14px] leading-4.5 tracking-[0.42px] uppercase'>
            {product.name || 'Untitled product'}
          </p>
        ) : (
          <Link
            href={`/product/${product.slug}`}
            className='hover:text-foreground/70 min-w-0 text-[14px] leading-4.5 tracking-[0.42px] uppercase transition-colors'
          >
            {product.name}
          </Link>
        )}
        <div className='shrink-0 text-right text-[14px] leading-4.5 tracking-[0.42px] uppercase'>
          {product.compare_at_price ? (
            <p className='text-muted-foreground text-xs line-through'>
              {formatPrice(product.compare_at_price)}
            </p>
          ) : null}
          <p>{formatPrice(product.price)}</p>
        </div>
      </div>
      <div className={cn('mt-2 flex items-center justify-between gap-3', !preview && 'px-4')}>
        <ColorSwatches colors={product.colors} shape='square' />
        {product.sizes.length > 0 ? (
          <ul
            className={cn(
              'flex gap-2 text-[11px] leading-none tracking-[0.22px] uppercase',
              preview
                ? 'opacity-100'
                : 'opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100'
            )}
          >
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
