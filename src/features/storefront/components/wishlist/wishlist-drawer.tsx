'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { productsByIdsQueryOptions } from '../../api/queries';
import { useCartStore } from '../../utils/cart-store';
import { formatPrice } from '../../utils/format-price';
import { firstInStockCartSelection } from '../../utils/wishlist-cart';
import { useWishlistStore } from '../../utils/wishlist-store';

type WishlistDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WishlistDrawer({ open, onOpenChange }: WishlistDrawerProps) {
  const productIds = useWishlistStore((s) => s.productIds);
  const hasHydrated = useWishlistStore((s) => s.hasHydrated);
  const toggle = useWishlistStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const prevProductIdsRef = useRef<string[]>([]);

  const { data: products = [], isLoading } = useQuery({
    ...productsByIdsQueryOptions(productIds),
    enabled: open && hasHydrated && productIds.length > 0
  });

  useEffect(() => {
    const previous = new Set(prevProductIdsRef.current);
    setSelectedIds((current) => {
      const kept = current.filter((id) => productIds.includes(id));
      const newlyAdded = productIds.filter((id) => !previous.has(id));
      return Array.from(new Set([...kept, ...newlyAdded]));
    });
    prevProductIdsRef.current = productIds;
  }, [productIds]);

  const isEmpty = hasHydrated && productIds.length === 0;
  const total = products.length || productIds.length;
  const selectedCount = selectedIds.filter((id) => productIds.includes(id)).length;
  const allSelected = total > 0 && selectedCount === total;
  const someSelected = selectedCount > 0 && selectedCount < total;

  function toggleSelected(productId: string, checked: boolean) {
    setSelectedIds((current) =>
      checked
        ? Array.from(new Set([...current, productId]))
        : current.filter((id) => id !== productId)
    );
  }

  function toggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? [...productIds] : []);
  }

  function selectedProducts() {
    const selected = new Set(selectedIds);
    return products.filter((product) => selected.has(product.id));
  }

  function addSelectedToCart() {
    const items = selectedProducts();
    if (items.length === 0) {
      toast.warning('Select items first', {
        description: 'Choose at least one wishlist item.'
      });
      return;
    }

    let added = 0;
    let skipped = 0;

    for (const product of items) {
      const selection = firstInStockCartSelection(product);
      if (!selection) {
        skipped += 1;
        continue;
      }
      const result = addItem({
        product,
        size: selection.size,
        color: selection.color
      });
      if (result.ok) {
        added += 1;
      } else {
        skipped += 1;
      }
    }

    if (added === 0) {
      toast.error('Could not add to cart', {
        description:
          skipped > 0
            ? 'Selected items are out of stock. Open a product to pick another size or color.'
            : 'Nothing was added.'
      });
      return;
    }

    toast.success(added === 1 ? 'Added to cart' : `Added ${added} items to cart`, {
      description:
        skipped > 0
          ? `${skipped} item${skipped === 1 ? '' : 's'} skipped — out of stock.`
          : undefined
    });
  }

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
          <div className='flex min-h-0 flex-1 flex-col'>
            <div className='border-border flex items-center gap-2 border-b px-5 py-3'>
              <Checkbox
                id='wishlist-select-all'
                aria-label='Select all wishlist items'
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
              />
              <label htmlFor='wishlist-select-all' className='cursor-pointer text-sm'>
                Select All
                <span className='text-muted-foreground'>
                  {' '}
                  ({selectedCount}/{total} selected)
                </span>
              </label>
            </div>

            <ul className='min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-6'>
              {isLoading
                ? productIds.map((id) => <li key={id} className='bg-muted h-20 animate-pulse' />)
                : products.map((product) => {
                    const image = product.images[0];
                    const isChecked = selectedIds.includes(product.id);
                    return (
                      <li key={product.id} className='flex items-start gap-3'>
                        <Checkbox
                          aria-label={`Select ${product.name}`}
                          className='mt-3'
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            toggleSelected(product.id, Boolean(checked))
                          }
                        />
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
              <Button
                className='h-10 w-full rounded-none uppercase'
                disabled={selectedCount === 0}
                onClick={addSelectedToCart}
              >
                Add to cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
