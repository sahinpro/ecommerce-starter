'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { MediaPickerDialog } from '@/features/media';
import { StatusBadge } from '@/components/ui/status-badge';
import { stockStatusLabel } from '@/features/orders/constants';

import {
  addProductColorMutation,
  addProductImageMutation,
  deleteProductColorMutation,
  deleteProductImageMutation,
  deleteProductVariantMutation,
  setPrimaryProductImageMutation,
  upsertProductVariantMutation
} from '../api/mutations';
import type { Product } from '../api/types';
import { formatProductPrice } from '../constants/product-options';

export function ProductNestedSections({ product }: { product: Product }) {
  return (
    <div className='space-y-6'>
      <ProductImagesSection product={product} />
      <ProductColorsSection product={product} />
      <ProductVariantsSection product={product} />
    </div>
  );
}

function ProductImagesSection({ product }: { product: Product }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const addMutation = useMutation({
    ...addProductImageMutation,
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add image');
    }
  });

  const deleteMutation = useMutation({
    ...deleteProductImageMutation,
    onSuccess: () => toast.success('Image detached (kept in media library)'),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove image');
    }
  });

  const primaryMutation = useMutation({
    ...setPrimaryProductImageMutation,
    onSuccess: () => toast.success('Primary image updated'),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to set primary image');
    }
  });

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between gap-3 space-y-0'>
        <CardTitle className='text-lg'>Images</CardTitle>
        <Button
          type='button'
          size='sm'
          className='cursor-pointer'
          onClick={() => setPickerOpen(true)}
        >
          <Icons.media className='size-4' />
          Add from library
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        {product.images.length > 0 ? (
          <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {product.images.map((image, index) => (
              <li key={image.id} className='flex items-center gap-3 rounded-md border p-3'>
                <div className='relative size-14 overflow-hidden rounded-md border'>
                  <Image
                    src={image.url}
                    alt={image.alt || product.name}
                    fill
                    className='object-cover'
                    sizes='56px'
                  />
                </div>
                <div className='min-w-0 flex-1 space-y-1'>
                  <p className='truncate text-xs font-mono'>{image.public_id || image.url}</p>
                  {index === 0 ? (
                    <p className='text-muted-foreground text-xs'>Primary (card hover uses #2)</p>
                  ) : (
                    <Button
                      type='button'
                      variant='link'
                      size='sm'
                      className='h-auto cursor-pointer px-0 text-xs'
                      disabled={primaryMutation.isPending}
                      onClick={() =>
                        primaryMutation.mutate({ productId: product.id, imageId: image.id })
                      }
                    >
                      Set as primary
                    </Button>
                  )}
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-8 cursor-pointer'
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(image.id)}
                  aria-label='Detach image'
                >
                  <Icons.trash className='size-4' />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className='text-muted-foreground text-sm'>
            No images yet. Add at least two for storefront hover fade.
          </p>
        )}

        <MediaPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          excludePublicIds={product.images
            .map((image) => image.public_id)
            .filter((id): id is string => Boolean(id))}
          onSelect={(assets) => {
            void (async () => {
              let added = 0;
              let sortOrder = product.images.length;
              for (const asset of assets) {
                try {
                  await addMutation.mutateAsync({
                    product_id: product.id,
                    url: asset.url,
                    public_id: asset.public_id,
                    alt: asset.alt || product.name,
                    sort_order: sortOrder,
                    media_asset_id: asset.id
                  });
                  sortOrder += 1;
                  added += 1;
                } catch {
                  // toast from onError
                }
              }
              if (added > 0) {
                toast.success(added === 1 ? 'Image attached' : `${added} images attached`);
              }
            })();
          }}
        />
      </CardContent>
    </Card>
  );
}

function ProductColorsSection({ product }: { product: Product }) {
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#000000');

  const addMutation = useMutation({
    ...addProductColorMutation,
    onSuccess: () => {
      setName('');
      setHex('#000000');
      toast.success('Color added');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add color');
    }
  });

  const deleteMutation = useMutation({
    ...deleteProductColorMutation,
    onSuccess: () => toast.success('Color removed'),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove color');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Colors</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {product.colors.length > 0 ? (
          <ul className='space-y-2'>
            {product.colors.map((color) => (
              <li
                key={color.id}
                className='flex items-center justify-between rounded-md border px-3 py-2'
              >
                <div className='flex items-center gap-3'>
                  <span
                    className='size-5 rounded-full border'
                    style={{ backgroundColor: color.hex }}
                    aria-hidden
                  />
                  <span className='text-sm font-medium'>{color.name}</span>
                  <span className='text-muted-foreground font-mono text-xs'>{color.hex}</span>
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-8'
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(color.id)}
                  aria-label={`Remove ${color.name}`}
                >
                  <Icons.trash className='size-4' />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className='text-muted-foreground text-sm'>Add at least one color for variants.</p>
        )}

        <div className='grid gap-3 sm:grid-cols-[1fr_120px_auto]'>
          <div className='space-y-2'>
            <Label htmlFor='color-name'>Name</Label>
            <Input
              id='color-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Ivory'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='color-hex'>Hex</Label>
            <Input
              id='color-hex'
              type='color'
              value={hex}
              onChange={(event) => setHex(event.target.value)}
            />
          </div>
          <div className='flex items-end'>
            <Button
              type='button'
              disabled={!name.trim() || addMutation.isPending}
              isLoading={addMutation.isPending}
              onClick={() =>
                addMutation.mutate({
                  product_id: product.id,
                  name: name.trim(),
                  hex
                })
              }
            >
              Add color
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductVariantsSection({ product }: { product: Product }) {
  const [sku, setSku] = useState('');
  const [size, setSize] = useState('');
  const [colorId, setColorId] = useState<string>('');
  const [price, setPrice] = useState<number | ''>(product.price);
  const [stock, setStock] = useState<number | ''>(0);
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({});

  const upsertMutation = useMutation({
    ...upsertProductVariantMutation,
    onSuccess: (_data, variables) => {
      setSku('');
      setSize('');
      setColorId('');
      setPrice(product.price);
      setStock(0);
      const qty = variables.stock_quantity ?? 0;
      if (qty <= 0) {
        toast.warning('Variant saved — out of stock', {
          description: `${variables.sku} has 0 units.`
        });
      } else if (qty <= 5) {
        toast.warning('Variant saved — low stock', {
          description: `${variables.sku} has ${qty} units left.`
        });
      } else {
        toast.success('Variant saved', {
          description: `${variables.sku} · ${qty} units in stock`
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to save variant', {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    }
  });

  const deleteMutation = useMutation({
    ...deleteProductVariantMutation,
    onSuccess: () => toast.success('Variant removed'),
    onError: (error) => {
      toast.error('Failed to remove variant', {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    }
  });

  const colorNameById = new Map(product.colors.map((color) => [color.id, color.name]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Variants & inventory</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {product.variants.length > 0 ? (
          <ul className='space-y-3'>
            {product.variants.map((variant) => {
              const status = stockStatusLabel(variant.stock_quantity);
              const draft = stockDrafts[variant.id] ?? variant.stock_quantity;
              return (
                <li
                  key={variant.id}
                  className='flex flex-col gap-3 rounded-md border px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between'
                >
                  <div className='space-y-1'>
                    <p className='font-medium'>
                      {variant.size}
                      {variant.color_id
                        ? ` / ${colorNameById.get(variant.color_id) ?? 'Color'}`
                        : ''}
                      <span className='text-muted-foreground font-normal'> · {variant.sku}</span>
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {formatProductPrice(variant.price)}
                    </p>
                    <p className='text-xs'>
                      <StatusBadge
                        tone={
                          status.tone === 'out'
                            ? 'danger'
                            : status.tone === 'low'
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {status.label} · {variant.stock_quantity}
                      </StatusBadge>
                    </p>
                  </div>
                  <div className='flex flex-wrap items-end gap-2'>
                    <div className='space-y-1'>
                      <Label htmlFor={`stock-${variant.id}`} className='text-xs'>
                        Stock
                      </Label>
                      <Input
                        id={`stock-${variant.id}`}
                        type='number'
                        min={0}
                        step={1}
                        className='w-24'
                        value={draft}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          setStockDrafts((prev) => ({
                            ...prev,
                            [variant.id]: Number.isFinite(value) ? value : 0
                          }));
                        }}
                      />
                    </div>
                    <Button
                      type='button'
                      size='sm'
                      className='cursor-pointer'
                      disabled={upsertMutation.isPending || draft === variant.stock_quantity}
                      isLoading={upsertMutation.isPending}
                      onClick={() =>
                        upsertMutation.mutate({
                          product_id: product.id,
                          sku: variant.sku,
                          size: variant.size,
                          color_id: variant.color_id,
                          price: variant.price,
                          compare_at_price: variant.compare_at_price,
                          stock_quantity: draft
                        })
                      }
                    >
                      Save stock
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='size-8 cursor-pointer'
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(variant.id)}
                      aria-label={`Remove ${variant.sku}`}
                    >
                      <Icons.trash className='size-4' />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className='text-muted-foreground text-sm'>
            Add variants with SKU, size, color, price, and stock.
          </p>
        )}

        <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-5'>
          <div className='space-y-2'>
            <Label htmlFor='variant-sku'>SKU</Label>
            <Input
              id='variant-sku'
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              placeholder='SKU-001'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='variant-size'>Size</Label>
            <Input
              id='variant-size'
              value={size}
              onChange={(event) => setSize(event.target.value)}
              placeholder='M'
            />
          </div>
          <div className='space-y-2'>
            <Label>Color</Label>
            <Select
              items={product.colors.map((color) => ({
                value: color.id,
                label: color.name
              }))}
              value={colorId || null}
              onValueChange={(value) => setColorId(value ?? '')}
            >
              <SelectTrigger className='w-full cursor-pointer'>
                <SelectValue placeholder='Select color' />
              </SelectTrigger>
              <SelectContent>
                {product.colors.map((color) => (
                  <SelectItem key={color.id} value={color.id} className='cursor-pointer'>
                    {color.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='variant-price'>Price (BDT)</Label>
            <Input
              id='variant-price'
              type='number'
              min={0}
              step={1}
              value={price}
              onChange={(event) => {
                const value = event.target.value;
                setPrice(value === '' ? '' : Number(value));
              }}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='variant-stock'>Stock quantity</Label>
            <Input
              id='variant-stock'
              type='number'
              min={0}
              step={1}
              value={stock}
              onChange={(event) => {
                const value = event.target.value;
                setStock(value === '' ? '' : Number(value));
              }}
            />
          </div>
        </div>

        <Button
          type='button'
          className='cursor-pointer'
          disabled={
            !sku.trim() || !size.trim() || price === '' || stock === '' || upsertMutation.isPending
          }
          isLoading={upsertMutation.isPending}
          onClick={() =>
            upsertMutation.mutate({
              product_id: product.id,
              sku: sku.trim(),
              size: size.trim(),
              color_id: colorId || null,
              price: Number(price),
              stock_quantity: Number(stock)
            })
          }
        >
          Save variant
        </Button>
      </CardContent>
    </Card>
  );
}
