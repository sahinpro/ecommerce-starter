'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { Product, ProductColor, ProductImage } from '../../api/types';
import { PRODUCT_IMAGE_FALLBACK } from '../../constants/product-image';
import { useCartStore } from '../../utils/cart-store';
import { formatPrice } from '../../utils/format-price';
import { useRecentlyViewedStore } from '../../utils/recently-viewed-store';
import { useWishlistStore } from '../../utils/wishlist-store';
import { ColorSwatches } from '../product/color-swatches';
import { ProductCard } from '../product/product-card';

type ProductDetailViewProps = {
  product: Product;
  related: Product[];
};

const detailTabs = ['Size / Fit', 'Composition', 'Care'] as const;

function DetailTabs({ product }: { product: Product }) {
  const [openTab, setOpenTab] = useState<string | null>('Size / Fit');

  const content: Record<(typeof detailTabs)[number], string> = {
    'Size / Fit': product.size_fit ?? '',
    Composition: product.composition ?? '',
    Care: product.care ?? ''
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
              className={cn('size-4 transition-transform', openTab === tab && 'rotate-180')}
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

function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = images[activeIndex] ?? images[0];
  const currentSrc = current?.url?.trim() || PRODUCT_IMAGE_FALLBACK;

  return (
    <div className='flex flex-col gap-3 px-4 lg:px-0'>
      <div className='bg-muted relative aspect-960/1087 w-full'>
        <Image
          src={currentSrc}
          alt={current?.alt ?? productName}
          fill
          priority
          className='object-cover'
          sizes='(max-width: 1024px) 100vw, 50vw'
        />
      </div>
      {images.length > 1 ? (
        <div className='grid grid-cols-4 gap-2'>
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image.id}
                type='button'
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-pressed={isActive}
                className={cn(
                  'bg-muted relative aspect-square overflow-hidden',
                  isActive ? 'ring-1 ring-sukoon-black' : 'opacity-70 hover:opacity-100'
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt ?? `${productName} ${index + 1}`}
                  fill
                  className='object-cover'
                  sizes='120px'
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function ProductDetailView({ product, related }: ProductDetailViewProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.has(product.id));

  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes[0]);

  useEffect(() => {
    function trackCurrent() {
      useRecentlyViewedStore.getState().track(product.id);
    }

    if (useRecentlyViewedStore.persist.hasHydrated()) {
      trackCurrent();
      return;
    }

    return useRecentlyViewedStore.persist.onFinishHydration(trackCurrent);
  }, [product.id]);

  function handleAddToCart() {
    if (!selectedColor || !selectedSize) {
      toast.warning('Select options', {
        description: 'Please choose a size and color first.'
      });
      return;
    }
    const result = addItem({
      product,
      size: selectedSize,
      color: selectedColor
    });
    if (!result.ok) {
      const isStock = /out of stock|only \d+ items are available/i.test(result.error);
      if (isStock) {
        toast.warning('Not enough stock', { description: result.error });
      } else {
        toast.error('Could not add to cart', { description: result.error });
      }
      return;
    }
    toast.success('Added to cart', {
      description: `${product.name} · ${selectedSize} / ${selectedColor.name}`
    });
  }

  return (
    <div>
      <div className='grid lg:grid-cols-2'>
        <ProductGallery key={product.id} images={product.images} productName={product.name} />

        <div className='sticky top-40 h-fit px-4 py-16 lg:max-w-md'>
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

          <p className='text-muted-foreground mt-6 text-sm leading-relaxed'>
            {product.description}
          </p>

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
        <section className='border-border border-t  py-16'>
          <h2 className='font-serif mb-8 text-2xl ml-4'>You may also like</h2>
          <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
