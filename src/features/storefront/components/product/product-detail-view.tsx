'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { Product, ProductColor } from '../../api/types';
import { useCartStore } from '../../utils/cart-store';
import { formatPrice } from '../../utils/format-price';
import { useWishlistStore } from '../../utils/wishlist-store';
import { ColorSwatches } from '../product/color-swatches';
import { ProductCard } from '../product/product-card';

type ProductDetailViewProps = {
  product: Product;
  related: Product[];
};

const detailTabs = ['Size / Fit', 'Composition', 'Care'] as const;

function DetailTabs({
  product
}: {
  product: Product;
}) {
  const [openTab, setOpenTab] = useState<string | null>('Size / Fit');

  const content: Record<(typeof detailTabs)[number], string> = {
    'Size / Fit': product.size_fit,
    Composition: product.composition,
    Care: product.care
  };

  return (
    <div className='mt-8 border-t'>
      {detailTabs.map((tab) => (
        <div key={tab} className='border-b'>
          <button
            type='button'
            onClick={() => setOpenTab(openTab === tab ? null : tab)}
            className='flex w-full items-center justify-between py-4 text-sm'
          >
            {tab}
            <Icons.chevronDown
              className={cn(
                'size-4 transition-transform',
                openTab === tab && 'rotate-180'
              )}
            />
          </button>
          {openTab === tab ? (
            <p className='text-muted-foreground pb-4 text-sm'>{content[tab]}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ProductDetailView({ product, related }: ProductDetailViewProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.has(product.id));

  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);

  function handleAddToCart() {
    if (!selectedColor || !selectedSize) {
      toast.error('Please select size and color');
      return;
    }
    addItem({ product, size: selectedSize, color: selectedColor });
    toast.success('Added to cart');
  }

  return (
    <div>
      <div className='grid lg:grid-cols-2'>
        <div className='space-y-0'>
          {product.images.map((image, index) => (
            <div key={image.id} className='bg-muted relative aspect-[960/1087] w-full'>
              <Image
                src={image.url}
                alt={image.alt}
                fill
                priority={index === 0}
                className='object-cover'
                sizes='(max-width: 1024px) 100vw, 50vw'
              />
            </div>
          ))}
        </div>

        <div className='sticky top-[160px] h-fit px-10 py-16 lg:max-w-md'>
          <div className='flex items-start justify-between gap-4'>
            <h1 className='font-serif text-3xl leading-tight'>{product.name}</h1>
            <button
              type='button'
              onClick={() => toggleWishlist(product.id)}
              aria-label='Add to wishlist'
              className={cn('mt-1', isWishlisted && 'text-red-500')}
            >
              <Icons.heart className={cn('size-4', isWishlisted && 'fill-current')} />
            </button>
          </div>

          <div className='mt-6 flex items-center gap-3'>
            {product.compare_at_price ? (
              <span className='text-muted-foreground line-through'>
                {formatPrice(product.compare_at_price)}
              </span>
            ) : null}
            <span className='text-lg'>{formatPrice(product.price)}</span>
          </div>

          <p className='text-muted-foreground mt-6 text-sm leading-relaxed'>{product.description}</p>

          <div className='mt-8 space-y-6'>
            <div className='flex items-center gap-4'>
              <ColorSwatches
                colors={product.colors}
                selectedId={selectedColor?.id}
                onSelect={setSelectedColor}
                size='md'
              />
              {selectedColor ? (
                <span className='text-muted-foreground text-sm'>{selectedColor.name}</span>
              ) : null}
            </div>

            <div className='flex flex-wrap gap-6'>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type='button'
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    'text-sm transition-colors',
                    selectedSize === size
                      ? 'text-foreground underline underline-offset-4'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>

            <Button
              onClick={handleAddToCart}
              className='h-11 w-full rounded-none tracking-wide uppercase'
            >
              Add to Cart
            </Button>
          </div>

          <DetailTabs product={product} />

          <p className='text-muted-foreground mt-6 text-[11px]'>
            Free express shipping on all Bangladesh orders.{' '}
            <button type='button' className='underline underline-offset-2'>
              Need help?
            </button>
          </p>
        </div>
      </div>

      {related.length > 0 ? (
        <section className='border-border border-t px-10 py-16'>
          <h2 className='font-serif mb-8 text-2xl'>You may also like</h2>
          <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <div className='px-10 pb-10 lg:hidden'>
        <Button
          onClick={() => router.push('/cart')}
          className='h-12 w-full rounded-none uppercase'
        >
          View Cart
        </Button>
      </div>
    </div>
  );
}
