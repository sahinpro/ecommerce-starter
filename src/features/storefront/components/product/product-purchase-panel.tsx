'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { findVariant } from '@/features/catalog/adapters';
import { cn } from '@/lib/utils';

import type { Product, ProductColor } from '../../api/types';
import { useCartStore } from '../../utils/cart-store';
import { formatPrice } from '../../utils/format-price';
import { useWishlistStore } from '../../utils/wishlist-store';
import { ColorSwatches } from './color-swatches';

const DETAIL_TABS = ['Size / Fit', 'Composition', 'Care'] as const;

type ProductPurchasePanelProps = {
  product: Product;
  className?: string;
  selectedColor?: ProductColor;
  onSelectedColorChange?: (color: ProductColor) => void;
};

function DetailTabs({ product }: { product: Product }) {
  const [openTab, setOpenTab] = useState<string | null>('Size / Fit');

  const content: Record<(typeof DETAIL_TABS)[number], string> = {
    'Size / Fit': product.size_fit ?? '',
    Composition: product.composition ?? '',
    Care: product.care ?? ''
  };

  return (
    <div className='mt-8 border-t'>
      {DETAIL_TABS.map((tab) => (
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
            <div className='space-y-4 pb-4'>
              {tab === 'Size / Fit' && product.size_fit_image_url ? (
                <div className='bg-muted relative aspect-4/3 w-full max-w-md overflow-hidden'>
                  <Image
                    src={product.size_fit_image_url}
                    alt='Size and fit'
                    fill
                    className='object-contain'
                    sizes='(max-width: 1024px) 100vw, 28rem'
                  />
                </div>
              ) : null}
              {content[tab] ? (
                <p className='text-muted-foreground text-sm'>{content[tab]}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ProductPurchasePanel({
  product,
  className,
  selectedColor: selectedColorProp,
  onSelectedColorChange
}: ProductPurchasePanelProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const wishlistHydrated = useWishlistStore((state) => state.hasHydrated);
  const isWishlisted = useWishlistStore((state) => state.has(product.id));
  const wishlisted = wishlistHydrated && isWishlisted;
  const colorControlled = onSelectedColorChange != null;

  const [internalColor, setInternalColor] = useState<ProductColor | undefined>(
    selectedColorProp ?? product.colors[0]
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes[0]);
  const selectedColor = colorControlled ? selectedColorProp : internalColor;

  useEffect(() => {
    if (colorControlled) return;
    setInternalColor((current) => {
      const stillThere = product.colors.find((color) => color.id === current?.id);
      return stillThere ?? product.colors[0];
    });
  }, [colorControlled, product.colors]);

  useEffect(() => {
    setSelectedSize((current) =>
      current && product.sizes.includes(current) ? current : product.sizes[0]
    );
  }, [product.sizes]);

  function selectColor(color: ProductColor) {
    if (colorControlled) {
      onSelectedColorChange?.(color);
      return;
    }
    setInternalColor(color);
  }

  const selectedVariant =
    selectedSize != null ? findVariant(product, selectedSize, selectedColor?.id) : undefined;
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayCompare = selectedVariant?.compare_at_price ?? product.compare_at_price;

  function handleAddToCart() {
    if (!selectedColor || !selectedSize) {
      toast.warning('Select options', {
        description: 'Please choose a size and color first.'
      });
      return;
    }
    if (!selectedVariant || selectedVariant.stock_quantity < 1) {
      toast.warning('Not enough stock', {
        description: 'This variant is out of stock.'
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
    <div className={className}>
      <div className='flex items-start justify-between gap-4'>
        <h1 className='font-serif text-3xl leading-tight'>{product.name}</h1>
        <button
          type='button'
          onClick={() => toggleWishlist(product.id)}
          aria-label='Add to wishlist'
          className='mt-1 cursor-pointer'
        >
          <Icons.heart
            className={cn('size-4 text-sukoon-black', wishlisted && 'fill-black text-black')}
          />
        </button>
      </div>

      <div className='mt-6 flex items-center gap-3'>
        {displayCompare ? (
          <span className='text-muted-foreground line-through'>{formatPrice(displayCompare)}</span>
        ) : null}
        <span className='text-lg'>{formatPrice(displayPrice)}</span>
      </div>

      {product.description ? (
        <p className='text-muted-foreground mt-6 text-sm leading-relaxed'>{product.description}</p>
      ) : null}

      <div className='mt-8 space-y-6'>
        {product.colors.length > 0 ? (
          <div className='flex items-center gap-4'>
            <ColorSwatches
              colors={product.colors}
              selectedId={selectedColor?.id}
              onSelect={selectColor}
              size='md'
            />
            {selectedColor ? (
              <span className='text-muted-foreground text-sm'>{selectedColor.name}</span>
            ) : null}
          </div>
        ) : null}

        {product.sizes.length > 0 ? (
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
        ) : null}

        <Button
          type='button'
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
  );
}
