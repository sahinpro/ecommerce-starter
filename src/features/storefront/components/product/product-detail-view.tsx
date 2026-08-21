'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type TouchEvent, type TransitionEvent } from 'react';

import { Icons } from '@/components/icons';

import { imagesForColor } from '@/features/catalog/adapters';
import { useActiveImageIndex } from '@/hooks/use-active-image-index';
import { cn } from '@/lib/utils';

import type { Product, ProductColor, ProductImage } from '../../api/types';
import { PRODUCT_IMAGE_FALLBACK } from '../../constants/product-image';
import { useRecentlyViewedStore } from '../../utils/recently-viewed-store';
import { ProductCard } from '../product/product-card';
import { ProductGalleryLightbox } from '../product/product-gallery-lightbox';
import { ProductPurchasePanel } from '../product/product-purchase-panel';

type ProductDetailViewProps = {
  product: Product;
  related: Product[];
};

function GalleryChrome({
  current,
  total,
  onOpen
}: {
  current: number;
  total: number;
  onOpen: () => void;
}) {
  return (
    <>
      <p className='px-2 py-1 text-[14px] leading-none' aria-live='polite'>
        {current} of {total}
      </p>
      <button
        type='button'
        onClick={onOpen}
        aria-label='View all images'
        className='pointer-events-auto flex size-12 shrink-0 cursor-pointer items-center justify-center'
      >
        <Icons.galleryPlus className='size-[22px]' width={22} height={22} />
      </button>
    </>
  );
}

function useColumnOverlayHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const overlayEl: HTMLDivElement = ref.current;

    function update() {
      const column = overlayEl.parentElement;
      if (!column) return;
      const rect = column.getBoundingClientRect();
      const top = Math.max(rect.top, 0);
      const bottom = Math.min(rect.bottom, window.innerHeight);
      setHeight(Math.max(0, bottom - top));
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return { ref, height };
}

function GalleryChromeBar({
  current,
  total,
  onOpen
}: {
  current: number;
  total: number;
  onOpen: () => void;
}) {
  const { ref, height } = useColumnOverlayHeight();

  return (
    <div
      ref={ref}
      className='pointer-events-none sticky top-0 z-10 flex items-end justify-between px-3 pb-3'
      style={{ height, marginBottom: -height }}
    >
      <GalleryChrome current={current} total={total} onOpen={onOpen} />
    </div>
  );
}

function GalleryImage({
  image,
  productName,
  index,
  priority = false
}: {
  image: ProductImage;
  productName: string;
  index: number;
  priority?: boolean;
}) {
  return (
    <div className='bg-muted relative aspect-960/1087 w-full'>
      <Image
        src={image.url.trim() || PRODUCT_IMAGE_FALLBACK}
        alt={image.alt ?? `${productName} ${index + 1}`}
        fill
        priority={priority}
        className='object-cover'
        sizes='(max-width: 1024px) 100vw, 50vw'
      />
    </div>
  );
}

function MobileGalleryCarousel({
  images,
  productName
}: {
  images: ProductImage[];
  productName: string;
}) {
  const looping = images.length > 1;
  const slides = looping ? [images[images.length - 1], ...images, images[0]] : images;
  const slideCount = Math.max(slides.length, 1);
  const [slide, setSlide] = useState(looping ? 1 : 0);
  const [animate, setAnimate] = useState(true);
  const isMoving = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const realIndex = looping
    ? slide === 0
      ? images.length - 1
      : slide === images.length + 1
        ? 0
        : slide - 1
    : slide;

  function goBy(step: 1 | -1) {
    if (!looping || isMoving.current) return;
    isMoving.current = true;
    setAnimate(true);
    setSlide((current) => current + step);
  }

  function onTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (slide === images.length + 1) {
      setAnimate(false);
      setSlide(1);
    } else if (slide === 0) {
      setAnimate(false);
      setSlide(images.length);
    }
    isMoving.current = false;
  }

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (start == null || !looping) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    goBy(dx < 0 ? 1 : -1);
  }

  return (
    <div className='relative lg:hidden' onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {looping ? (
        <div className='pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-3 pb-3'>
          <p className='px-2 py-1 text-[14px] leading-none' aria-live='polite'>
            {realIndex + 1} of {images.length}
          </p>
          <button
            type='button'
            onClick={() => goBy(1)}
            aria-label='Next image'
            className='pointer-events-auto flex size-12 shrink-0 cursor-pointer items-center justify-center'
          >
            <Icons.chevronRight className='size-6' />
          </button>
        </div>
      ) : null}

      <div className='overflow-hidden'>
        {images.length > 0 ? (
          <div
            className={cn(
              'flex',
              animate && 'transition-transform duration-300 ease-out motion-reduce:transition-none'
            )}
            style={{
              width: `${slideCount * 100}%`,
              transform: `translate3d(-${(slide / slideCount) * 100}%, 0, 0)`
            }}
            onTransitionEnd={onTransitionEnd}
          >
            {slides.map((image, index) => (
              <div
                key={`${image.id}-${index}`}
                className='relative'
                style={{ width: `${100 / slideCount}%` }}
              >
                <GalleryImage
                  image={image}
                  productName={productName}
                  index={looping ? (index === 0 ? images.length - 1 : index - 1) : index}
                  priority={index === (looping ? 1 : 0)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className='bg-muted relative aspect-960/1087 w-full'>
            <Image
              src={PRODUCT_IMAGE_FALLBACK}
              alt={productName}
              fill
              priority
              className='object-cover'
              sizes='100vw'
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);
  const { activeIndex, imageRefs } = useActiveImageIndex(images.length, null, true);

  const showChrome = images.length > 1;

  function openLightbox() {
    setLightboxStart(activeIndex);
    setLightboxOpen(true);
  }

  return (
    <div className='px-0'>
      <MobileGalleryCarousel images={images} productName={productName} />

      <div className='relative hidden lg:block'>
        {showChrome ? (
          <GalleryChromeBar current={activeIndex + 1} total={images.length} onOpen={openLightbox} />
        ) : null}
        <div className='flex flex-col'>
          {images.length > 0 ? (
            images.map((image, index) => (
              <div key={image.id} ref={imageRefs[index]}>
                <GalleryImage
                  image={image}
                  productName={productName}
                  index={index}
                  priority={index === 0}
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

      {showChrome ? (
        <ProductGalleryLightbox
          images={images}
          productName={productName}
          startIndex={lightboxStart}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      ) : null}
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
          className='sticky top-40 h-fit px-4 py-16 lg:max-w-2xl lg:pt-27.5 lg:pr-10 lg:pb-8 lg:pl-30.75'
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
