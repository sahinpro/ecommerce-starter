'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { imagesForColor } from '@/features/catalog/adapters';

import type { Product, ProductColor, ProductImage } from '../../api/types';
import { PRODUCT_IMAGE_FALLBACK } from '../../constants/product-image';
import { useRecentlyViewedStore } from '../../utils/recently-viewed-store';
import { ProductCard } from '../product/product-card';
import { ProductPurchasePanel } from '../product/product-purchase-panel';

type ProductDetailViewProps = {
  product: Product;
  related: Product[];
};

function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = images[activeIndex] ?? images[0];
  const currentSrc = current?.url?.trim() || PRODUCT_IMAGE_FALLBACK;

  return (
    <div className='px-4 lg:px-0'>
      <div className='flex flex-col gap-3 lg:hidden'>
        <div className='bg-muted relative aspect-960/1087 w-full'>
          <Image
            src={currentSrc}
            alt={current?.alt ?? productName}
            fill
            priority
            className='object-cover'
            sizes='100vw'
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

      <div className='hidden flex-col gap-3 lg:flex'>
        {images.length > 0 ? (
          images.map((image, index) => (
            <div key={image.id} className='bg-muted relative aspect-960/1087 w-full'>
              <Image
                src={image.url.trim() || PRODUCT_IMAGE_FALLBACK}
                alt={image.alt ?? `${productName} ${index + 1}`}
                fill
                priority={index === 0}
                className='object-cover'
                sizes='50vw'
              />
            </div>
          ))
        ) : (
          <div className='bg-muted relative aspect-960/1087 w-full'>
            <Image
              src={PRODUCT_IMAGE_FALLBACK}
              alt={productName}
              fill
              priority
              className='object-cover'
              sizes='50vw'
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductDetailView({ product, related }: ProductDetailViewProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(undefined);
  const galleryImages = imagesForColor(product, selectedColor?.id);

  useEffect(() => {
    setSelectedColor((current) => {
      if (!current) return undefined;
      return product.colors.find((color) => color.id === current.id);
    });
  }, [product.colors]);

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

  return (
    <div>
      <div className='grid lg:grid-cols-2'>
        <ProductGallery
          key={`${product.id}-${selectedColor?.id ?? 'default'}`}
          images={galleryImages}
          productName={product.name}
        />

        <ProductPurchasePanel
          product={product}
          selectedColor={selectedColor}
          onSelectedColorChange={(color) => setSelectedColor(color)}
          className='sticky top-40 h-fit px-4 py-16 lg:max-w-md'
        />
      </div>

      {related.length > 0 ? (
        <section className='border-border border-t py-16'>
          <h2 className='font-serif mb-8 ml-4 text-2xl'>You may also like</h2>
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
