'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { productsByIdsQueryOptions } from '../../api/queries';
import { formatPrice } from '../../utils/format-price';
import { useWishlistStore } from '../../utils/wishlist-store';

type WishlistDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WishlistDrawer({ open, onOpenChange }: WishlistDrawerProps) {
  const productIds = useWishlistStore((s) => s.productIds);
  const hasHydrated = useWishlistStore((s) => s.hasHydrated);
  const toggle = useWishlistStore((s) => s.toggle);

  const { data: products = [], isLoading } = useQuery({
    ...productsByIdsQueryOptions(productIds),
    enabled: open && hasHydrated && productIds.length > 0
  });

  const isEmpty = hasHydrated && productIds.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full max-w-100 rounded-none p-0'>
        <SheetHeader className='border-border border-b px-5 py-8'>
          <SheetTitle className='flex items-center gap-2 text-base font-normal'>
            <Icons.heart className='size-4' />
            My Wishlist
          </SheetTitle>
        </SheetHeader>

        {isEmpty ? (
          <div className='flex flex-col items-center px-5 py-10 text-center'>
            <Icons.heart className='text-muted-foreground mb-6 size-14 stroke-1' />
            <p className='text-sm font-medium'>Save things as you browse</p>
            <p className='text-muted-foreground mt-2 max-w-xs text-sm'>
              Tap ♡ on any product. It lands here so you don&apos;t lose it.
            </p>

            <div className='bg-muted mt-8 w-full p-4 text-left text-sm'>
              <p>Saves stay on this device.</p>
              <p className='mt-1 font-medium'>No account needed — guest shopping only.</p>
            </div>

            <Button className='mt-6 h-10 w-full rounded-none' onClick={() => onOpenChange(false)}>
              Keep browsing
            </Button>
          </div>
        ) : (
          <div className='flex h-[calc(100%-5.5rem)] flex-col'>
            <ul className='flex-1 space-y-4 overflow-y-auto px-5 py-6'>
              {isLoading
                ? productIds.map((id) => <li key={id} className='bg-muted h-20 animate-pulse' />)
                : products.map((product) => {
                    const image = product.images[0];
                    return (
                      <li key={product.id} className='flex gap-3'>
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={() => onOpenChange(false)}
                          className='bg-muted relative size-20 shrink-0 overflow-hidden'
                        >
                          {image ? (
                            <Image
                              src={image.url}
                              alt={image.alt ?? product.name}
                              fill
                              className='object-cover'
                              sizes='80px'
                            />
                          ) : null}
                        </Link>
                        <div className='min-w-0 flex-1'>
                          <Link
                            href={`/product/${product.slug}`}
                            onClick={() => onOpenChange(false)}
                            className='block text-sm tracking-wide uppercase'
                          >
                            {product.name}
                          </Link>
                          <p className='mt-1 text-sm'>{formatPrice(product.price)}</p>
                          <button
                            type='button'
                            className='text-muted-foreground mt-2 text-xs underline underline-offset-2'
                            onClick={() => toggle(product.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
            </ul>
            <div className='border-border border-t px-5 py-4'>
              <p className='text-muted-foreground mb-3 text-xs'>
                Saves stay on this device. No account needed.
              </p>
              <Button className='h-10 w-full rounded-none' onClick={() => onOpenChange(false)}>
                Keep browsing
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
