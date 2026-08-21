'use client';

import Image from 'next/image';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
import { useActiveImageIndex } from '@/hooks/use-active-image-index';
import { cn } from '@/lib/utils';

import type { ProductImage } from '../../api/types';
import { PRODUCT_IMAGE_FALLBACK } from '../../constants/product-image';

type ProductGalleryLightboxProps = {
  images: ProductImage[];
  productName: string;
  startIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductGalleryLightbox({
  images,
  productName,
  startIndex,
  open,
  onOpenChange
}: ProductGalleryLightboxProps) {
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
  const { activeIndex, setActiveIndex, imageRefs, getElement } = useActiveImageIndex(
    images.length,
    scrollRoot,
    open && Boolean(scrollRoot)
  );

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const clamped = Math.min(Math.max(index, 0), images.length - 1);
      setActiveIndex(clamped);
      getElement(clamped)?.scrollIntoView({ behavior, block: 'start' });
    },
    [getElement, images.length, setActiveIndex]
  );

  useLayoutEffect(() => {
    if (!open || !scrollRoot) return;
    scrollToIndex(startIndex, 'auto');
  }, [open, scrollRoot, startIndex, scrollToIndex]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, open, scrollToIndex]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'fixed inset-0 z-10000 max-w-none translate-x-0 translate-y-0 overflow-hidden bg-white',
          'block h-dvh w-screen rounded-none border-0 p-0 shadow-none duration-0 sm:max-w-none',
          'data-open:zoom-in-100 data-closed:zoom-out-100',
          '[&>button:last-child]:hidden'
        )}
      >
        <DialogTitle className='sr-only'>{productName} images</DialogTitle>
        <DialogDescription className='sr-only'>
          Full-size gallery. Use arrow keys to move between images.
        </DialogDescription>

        <DialogClose className='absolute top-8 right-10 z-20 cursor-pointer opacity-100 hover:opacity-70'>
          <Icons.galleryClose />
          <span className='sr-only'>Close</span>
        </DialogClose>

        <div
          ref={setScrollRoot}
          className='h-full overflow-y-auto overscroll-contain py-18 px-40.75'
        >
          <div className='grid grid-cols-[88px_minmax(0,1fr)] gap-8'>
            <nav
              aria-label='Image thumbnails'
              className='sticky top-0 self-start max-h-[calc(100dvh-144px)] overflow-y-auto'
            >
              <div className='flex flex-col gap-2'>
                {images.map((image, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={image.id}
                      type='button'
                      onClick={() => scrollToIndex(index)}
                      aria-label={`View image ${index + 1} of ${images.length}`}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'block w-full cursor-pointer',
                        isActive ? 'opacity-100' : 'opacity-50 hover:opacity-100'
                      )}
                    >
                      <Image
                        src={image.url.trim() || PRODUCT_IMAGE_FALLBACK}
                        alt={image.alt ?? `${productName} ${index + 1}`}
                        width={300}
                        height={380}
                        className='h-auto w-full'
                        sizes='72px'
                      />
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className='min-w-0'>
              {images.map((image, index) => (
                <div key={image.id} ref={imageRefs[index]} className='w-full'>
                  <Image
                    src={image.url.trim() || PRODUCT_IMAGE_FALLBACK}
                    alt={image.alt ?? `${productName} ${index + 1}`}
                    width={2560}
                    height={3200}
                    className='h-auto w-full'
                    sizes='70vw'
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
