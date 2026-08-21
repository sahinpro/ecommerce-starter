'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { imageForMediaAsset, variantDisplayName } from '@/features/catalog/adapters';
import {
  combinationKey,
  generateOptionCombinations,
  groupVariantsByColor
} from '@/features/catalog/variant-engine';
import { stockStatusLabel } from '@/features/orders/constants';
import { cn } from '@/lib/utils';

import { patchCachedProduct, productWithoutVariant, restoreCachedProduct } from '../api/cache';
import {
  catalogRevalidate,
  deleteProductVariantMutation,
  generateProductVariantsMutation,
  upsertProductVariantMutation
} from '../api/mutations';
import type { Product, ProductVariant } from '../api/types';
import { formatProductPrice } from '../constants/product-options';

type VariantDraft = {
  price: number;
  compare: number | '';
  stock: number;
};

function draftFromVariant(variant: ProductVariant): VariantDraft {
  return {
    price: variant.price,
    compare: variant.compare_at_price ?? '',
    stock: variant.stock_quantity
  };
}

function isDraftDirty(variant: ProductVariant, draft: VariantDraft): boolean {
  const compare = draft.compare === '' ? null : Number(draft.compare);
  return (
    draft.price !== variant.price ||
    compare !== variant.compare_at_price ||
    draft.stock !== variant.stock_quantity
  );
}

function priceRangeLabel(variants: ProductVariant[]): string {
  const prices = variants.map((variant) => variant.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return formatProductPrice(min);
  return `${formatProductPrice(min)} – ${formatProductPrice(max)}`;
}

export function ProductVariantsSection({ product }: { product: Product }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, VariantDraft>>({});
  const [bulkPrice, setBulkPrice] = useState<number | ''>('');
  const [bulkStock, setBulkStock] = useState<number | ''>('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const generateMutation = useMutation({
    ...generateProductVariantsMutation,
    onSuccess: (result) => {
      toast.success(
        result.created === 0
          ? 'No new combinations to create'
          : `Generated ${result.created} variants`
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to generate variants');
    }
  });

  const upsertMutation = useMutation({
    ...upsertProductVariantMutation,
    onError: (error) => {
      toast.error('Failed to save variant', {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    }
  });

  const deleteMutation = useMutation({
    ...deleteProductVariantMutation,
    onMutate: ({ id }) => {
      const snapshot = patchCachedProduct(product, (current) => productWithoutVariant(current, id));
      return { snapshot };
    },
    onSuccess: () => toast.success('Variant removed'),
    onError: (error, _id, context) => {
      restoreCachedProduct(product, context?.snapshot);
      toast.error(error instanceof Error ? error.message : 'Failed to remove variant');
    }
  });

  const expected = generateOptionCombinations(product.options);
  const existingKeys = new Set(
    product.variants.map((variant) =>
      variant.option_values.map((value) => value.value_id).join(':')
    )
  );
  const missing = expected.filter((combo) => !existingKeys.has(combinationKey(combo))).length;
  const groups = groupVariantsByColor(product.variants, product.options);
  const groupedByColor = groups.length > 1 || Boolean(groups[0]?.colorValue);

  const selectedIds = Object.entries(selected)
    .filter(([, value]) => value)
    .map(([id]) => id);

  function draftFor(variant: ProductVariant): VariantDraft {
    return drafts[variant.id] ?? draftFromVariant(variant);
  }

  function setDraft(variant: ProductVariant, patch: Partial<VariantDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [variant.id]: { ...draftFor(variant), ...patch }
    }));
  }

  async function saveVariant(variant: ProductVariant, draft: VariantDraft) {
    if (!isDraftDirty(variant, draft)) return;
    await upsertMutation.mutateAsync({
      product_id: product.id,
      variant_id: variant.id,
      price: draft.price,
      compare_at_price: draft.compare === '' ? null : Number(draft.compare),
      barcode: variant.barcode,
      stock_quantity: draft.stock,
      option_value_ids: variant.option_values.map((value) => value.value_id),
      ...catalogRevalidate(product)
    });
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[variant.id];
      return next;
    });
  }

  return (
    <Card id='product-variants' className='scroll-mt-24'>
      <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-3 space-y-0'>
        <CardTitle className='text-lg'>Variants & inventory</CardTitle>
        <Button
          type='button'
          className='cursor-pointer'
          disabled={expected.length === 0 || generateMutation.isPending || !product.sku}
          isLoading={generateMutation.isPending}
          onClick={() =>
            generateMutation.mutate({ productId: product.id, ...catalogRevalidate(product) })
          }
        >
          Generate combinations
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-muted-foreground text-sm'>
          {product.sku ? `Product SKU ${product.sku}. ` : 'Save a product SKU first. '}
          {expected.length > 0
            ? `${expected.length} possible combinations${missing > 0 ? ` · ${missing} not created yet` : ''}.`
            : 'Add option values, then generate combinations.'}
        </p>

        {product.variants.length > 0 ? (
          <div className='space-y-3'>
            {selectedIds.length > 0 ? (
              <div className='flex flex-wrap items-end gap-2 rounded-md border px-3 py-2'>
                <p className='w-full text-[13px] font-medium'>{selectedIds.length} selected</p>
                <div className='space-y-1'>
                  <Label className='text-[11px]'>Bulk price</Label>
                  <Input
                    type='number'
                    min={0}
                    className='h-8 w-28 text-[13px]'
                    value={bulkPrice}
                    onChange={(event) =>
                      setBulkPrice(event.target.value === '' ? '' : Number(event.target.value))
                    }
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-[11px]'>Bulk stock</Label>
                  <Input
                    type='number'
                    min={0}
                    className='h-8 w-24 text-[13px]'
                    value={bulkStock}
                    onChange={(event) =>
                      setBulkStock(event.target.value === '' ? '' : Number(event.target.value))
                    }
                  />
                </div>
                <Button
                  type='button'
                  size='sm'
                  className='h-8 cursor-pointer'
                  disabled={upsertMutation.isPending}
                  onClick={() => {
                    void (async () => {
                      for (const id of selectedIds) {
                        const variant = product.variants.find((item) => item.id === id);
                        if (!variant) continue;
                        const nextPrice = bulkPrice === '' ? variant.price : Number(bulkPrice);
                        const nextStock =
                          bulkStock === '' ? variant.stock_quantity : Number(bulkStock);
                        await upsertMutation.mutateAsync({
                          product_id: product.id,
                          variant_id: variant.id,
                          price: nextPrice,
                          compare_at_price: variant.compare_at_price,
                          barcode: variant.barcode,
                          option_value_ids: variant.option_values.map((value) => value.value_id),
                          stock_quantity: nextStock,
                          ...catalogRevalidate(product)
                        });
                      }
                      setSelected({});
                      setBulkPrice('');
                      setBulkStock('');
                    })();
                  }}
                >
                  Apply
                </Button>
              </div>
            ) : null}

            {groupedByColor ? (
              <ul className='divide-y rounded-md border'>
                {groups.map((group) => {
                  const open = Boolean(openGroups[group.key]);
                  const hex =
                    typeof group.colorValue?.metadata?.hex === 'string'
                      ? group.colorValue.metadata.hex
                      : null;
                  const thumb = imageForMediaAsset(product, group.colorValue?.media_asset_ids[0]);
                  const totalStock = group.variants.reduce(
                    (sum, variant) => sum + variant.stock_quantity,
                    0
                  );
                  return (
                    <li key={group.key}>
                      <Collapsible
                        open={open}
                        onOpenChange={(next) =>
                          setOpenGroups((prev) => ({ ...prev, [group.key]: next }))
                        }
                      >
                        <div className='flex items-center gap-2 px-2 py-1.5'>
                          <CollapsibleTrigger className='hover:bg-muted/60 flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-left'>
                            <Icons.chevronRight
                              className={cn(
                                'text-muted-foreground size-3.5 shrink-0 transition-transform',
                                open && 'rotate-90'
                              )}
                            />
                            <span className='relative size-8 shrink-0 overflow-hidden rounded-md border'>
                              {thumb ? (
                                <Image
                                  src={thumb.url}
                                  alt={group.colorValue?.name ?? 'Variant'}
                                  fill
                                  className='object-cover'
                                  sizes='32px'
                                />
                              ) : hex ? (
                                <span
                                  className='absolute inset-0'
                                  style={{ backgroundColor: hex }}
                                />
                              ) : (
                                <span className='bg-muted absolute inset-0' />
                              )}
                            </span>
                            <span className='min-w-0 flex-1 truncate text-[13px] font-medium'>
                              {group.colorValue?.name ?? 'Other'}
                            </span>
                            <span className='text-muted-foreground hidden text-[12px] sm:inline'>
                              {group.variants.length} variants
                            </span>
                            <span className='text-[12px] tabular-nums'>
                              {priceRangeLabel(group.variants)}
                            </span>
                            <span className='text-muted-foreground text-[12px] tabular-nums'>
                              {totalStock}
                            </span>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                          <ul className='border-t'>
                            {group.variants.map((variant) => (
                              <VariantRow
                                key={variant.id}
                                variant={variant}
                                draft={draftFor(variant)}
                                selected={Boolean(selected[variant.id])}
                                saving={upsertMutation.isPending}
                                deleting={deleteMutation.isPending}
                                onSelect={(value) =>
                                  setSelected((prev) => ({ ...prev, [variant.id]: value }))
                                }
                                onDraft={(patch) => setDraft(variant, patch)}
                                onSave={() => void saveVariant(variant, draftFor(variant))}
                                onDelete={() =>
                                  deleteMutation.mutate({
                                    id: variant.id,
                                    ...catalogRevalidate(product)
                                  })
                                }
                              />
                            ))}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className='divide-y rounded-md border'>
                {(groups[0]?.variants ?? product.variants).map((variant) => (
                  <li key={variant.id}>
                    <VariantRow
                      variant={variant}
                      draft={draftFor(variant)}
                      selected={Boolean(selected[variant.id])}
                      saving={upsertMutation.isPending}
                      deleting={deleteMutation.isPending}
                      onSelect={(value) =>
                        setSelected((prev) => ({ ...prev, [variant.id]: value }))
                      }
                      onDraft={(patch) => setDraft(variant, patch)}
                      onSave={() => void saveVariant(variant, draftFor(variant))}
                      onDelete={() =>
                        deleteMutation.mutate({ id: variant.id, ...catalogRevalidate(product) })
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>
            No variants yet. Generate combinations after options are defined.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

type VariantRowProps = {
  variant: ProductVariant;
  draft: VariantDraft;
  selected: boolean;
  saving: boolean;
  deleting: boolean;
  onSelect: (value: boolean) => void;
  onDraft: (patch: Partial<VariantDraft>) => void;
  onSave: () => void;
  onDelete: () => void;
};

function VariantRow({
  variant,
  draft,
  selected,
  saving,
  deleting,
  onSelect,
  onDraft,
  onSave,
  onDelete
}: VariantRowProps) {
  const status = stockStatusLabel(variant.stock_quantity);
  const sizeLabel =
    variant.size ||
    variant.option_values.find((value) => value.option_name.toLowerCase() === 'size')?.value_name ||
    variantDisplayName(variant);

  return (
    <div className='flex flex-wrap items-center gap-2 px-3 py-1.5 text-[13px]'>
      <label className='flex min-w-28 flex-1 items-center gap-2'>
        <Checkbox checked={selected} onCheckedChange={(value) => onSelect(value === true)} />
        <span className='truncate font-medium'>{sizeLabel}</span>
        {variant.status === 'archived' ? (
          <StatusBadge tone='warning'>Archived</StatusBadge>
        ) : (
          <StatusBadge
            tone={status.tone === 'out' ? 'danger' : status.tone === 'low' ? 'warning' : 'success'}
          >
            {status.label}
          </StatusBadge>
        )}
      </label>
      <Input
        type='number'
        min={0}
        aria-label={`Price for ${sizeLabel}`}
        className='h-8 w-24 text-[13px]'
        value={draft.price}
        onChange={(event) => onDraft({ price: Number(event.target.value) || 0 })}
        onBlur={onSave}
      />
      <Input
        type='number'
        min={0}
        aria-label={`Compare-at price for ${sizeLabel}`}
        className='h-8 w-24 text-[13px]'
        placeholder='Compare'
        value={draft.compare}
        onChange={(event) =>
          onDraft({ compare: event.target.value === '' ? '' : Number(event.target.value) })
        }
        onBlur={onSave}
      />
      <Input
        type='number'
        min={0}
        aria-label={`Inventory for ${sizeLabel}`}
        className='h-8 w-20 text-[13px]'
        value={draft.stock}
        onChange={(event) => onDraft({ stock: Number(event.target.value) || 0 })}
        onBlur={onSave}
      />
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='size-8 cursor-pointer'
        disabled={saving || !isDraftDirty(variant, draft)}
        isLoading={saving}
        onClick={onSave}
        aria-label={`Save ${sizeLabel}`}
      >
        <Icons.check className='size-3.5' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='size-8 cursor-pointer'
        disabled={deleting}
        onClick={onDelete}
        aria-label={`Remove ${variantDisplayName(variant)}`}
      >
        <Icons.trash className='size-3.5' />
      </Button>
    </div>
  );
}
