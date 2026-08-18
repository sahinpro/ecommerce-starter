'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaPickerDialog } from '@/features/media';
import { StatusBadge } from '@/components/ui/status-badge';
import { variantDisplayName } from '@/features/catalog/adapters';
import { previewOptionValueUsage } from '../api/service';
import {
  combinationKey,
  generateOptionCombinations,
  isColorOptionName
} from '@/features/catalog/variant-engine';
import { stockStatusLabel } from '@/features/orders/constants';

import {
  addProductImageMutation,
  addProductOptionMutation,
  addProductOptionValueMutation,
  deleteProductImageMutation,
  deleteProductOptionMutation,
  deleteProductVariantMutation,
  generateProductVariantsMutation,
  removeProductOptionValueMutation,
  setPrimaryProductImageMutation,
  setVariantInventoryMutation,
  setVariantMediaMutation,
  upsertProductVariantMutation
} from '../api/mutations';
import type { Product } from '../api/types';
import { formatProductPrice } from '../constants/product-options';

const OPTION_PRESETS = ['Size', 'Color', 'Material'] as const;

export function ProductNestedSections({ product }: { product: Product }) {
  return (
    <div className='space-y-6'>
      <ProductImagesSection product={product} />
      <ProductOptionsSection product={product} />
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

function ProductOptionsSection({ product }: { product: Product }) {
  const [optionName, setOptionName] = useState('');
  const [valueDrafts, setValueDrafts] = useState<Record<string, { name: string; hex: string }>>({});
  const [pendingDelete, setPendingDelete] = useState<{
    kind: 'value' | 'option';
    id: string;
    label: string;
    count: number;
  } | null>(null);

  const addOptionMutation = useMutation({
    ...addProductOptionMutation,
    onSuccess: () => {
      setOptionName('');
      toast.success('Option added');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add option');
    }
  });

  const addValueMutation = useMutation({
    ...addProductOptionValueMutation,
    onSuccess: (_data, variables) => {
      setValueDrafts((prev) => ({
        ...prev,
        [variables.option_id]: { name: '', hex: '#000000' }
      }));
      toast.success('Value added');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add value');
    }
  });

  const removeValueMutation = useMutation({
    ...removeProductOptionValueMutation,
    onSuccess: (result) => {
      setPendingDelete(null);
      const extra =
        result.removed_variants + result.archived_variants > 0
          ? ` ${result.removed_variants} removed, ${result.archived_variants} archived.`
          : '';
      toast.success(`Value removed.${extra}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove value');
    }
  });

  const deleteOptionMutation = useMutation({
    ...deleteProductOptionMutation,
    onSuccess: () => {
      setPendingDelete(null);
      toast.success('Option removed');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove option');
    }
  });

  async function requestDeleteValue(id: string, label: string) {
    try {
      const usage = await previewOptionValueUsage(id);
      if (usage.count === 0) {
        removeValueMutation.mutate({ id, confirm: false });
        return;
      }
      setPendingDelete({ kind: 'value', id, label, count: usage.count });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not check value usage');
    }
  }

  const remainingPresets = OPTION_PRESETS.filter(
    (preset) =>
      !product.options.some((option) => option.name.toLowerCase() === preset.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Options</CardTitle>
      </CardHeader>
      <CardContent className='space-y-5'>
        <p className='text-muted-foreground text-sm'>
          Up to 3 options. Color values can include a hex swatch for the storefront.
        </p>

        {product.options.length > 0 ? (
          <div className='space-y-4'>
            {product.options.map((option) => {
              const draft = valueDrafts[option.id] ?? { name: '', hex: '#000000' };
              const isColor = isColorOptionName(option.name);
              return (
                <div key={option.id} className='space-y-3 rounded-md border p-3'>
                  <div className='flex items-center justify-between gap-3'>
                    <p className='font-medium'>{option.name}</p>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='size-8 cursor-pointer'
                      aria-label={`Remove ${option.name}`}
                      disabled={deleteOptionMutation.isPending}
                      onClick={() =>
                        setPendingDelete({
                          kind: 'option',
                          id: option.id,
                          label: option.name,
                          count: option.values.length
                        })
                      }
                    >
                      <Icons.trash className='size-4' />
                    </Button>
                  </div>
                  <ul className='flex flex-wrap gap-2'>
                    {option.values.map((value) => {
                      const hex =
                        typeof value.metadata?.hex === 'string' ? value.metadata.hex : null;
                      return (
                        <li
                          key={value.id}
                          className='flex items-center gap-2 rounded-full border px-3 py-1 text-sm'
                        >
                          {hex ? (
                            <span
                              className='size-3 rounded-full border'
                              style={{ backgroundColor: hex }}
                              aria-hidden
                            />
                          ) : null}
                          <span>{value.name}</span>
                          <button
                            type='button'
                            className='text-muted-foreground hover:text-foreground cursor-pointer'
                            aria-label={`Remove ${value.name}`}
                            onClick={() => void requestDeleteValue(value.id, value.name)}
                          >
                            <Icons.close className='size-3.5' />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className='grid gap-3 sm:grid-cols-[1fr_auto_auto]'>
                    <Input
                      value={draft.name}
                      placeholder={isColor ? 'Cream' : 'Add value'}
                      onChange={(event) =>
                        setValueDrafts((prev) => ({
                          ...prev,
                          [option.id]: { ...draft, name: event.target.value }
                        }))
                      }
                    />
                    {isColor ? (
                      <Input
                        type='color'
                        className='h-9 w-16 cursor-pointer'
                        value={draft.hex}
                        onChange={(event) =>
                          setValueDrafts((prev) => ({
                            ...prev,
                            [option.id]: { ...draft, hex: event.target.value }
                          }))
                        }
                      />
                    ) : null}
                    <Button
                      type='button'
                      disabled={!draft.name.trim() || addValueMutation.isPending}
                      isLoading={addValueMutation.isPending}
                      onClick={() =>
                        addValueMutation.mutate({
                          option_id: option.id,
                          name: draft.name.trim(),
                          hex: isColor ? draft.hex : null
                        })
                      }
                    >
                      Add value
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>
            Add Size and Color to generate a variant matrix.
          </p>
        )}

        {product.options.length < 3 ? (
          <div className='flex flex-wrap items-end gap-2'>
            <div className='min-w-40 flex-1 space-y-2'>
              <Label htmlFor='option-name'>Option name</Label>
              <Input
                id='option-name'
                value={optionName}
                placeholder='Size'
                onChange={(event) => setOptionName(event.target.value)}
              />
            </div>
            {remainingPresets.map((preset) => (
              <Button
                key={preset}
                type='button'
                variant='outline'
                className='cursor-pointer'
                disabled={addOptionMutation.isPending}
                onClick={() => addOptionMutation.mutate({ product_id: product.id, name: preset })}
              >
                {preset}
              </Button>
            ))}
            <Button
              type='button'
              disabled={!optionName.trim() || addOptionMutation.isPending}
              isLoading={addOptionMutation.isPending}
              onClick={() =>
                addOptionMutation.mutate({ product_id: product.id, name: optionName.trim() })
              }
            >
              Add option
            </Button>
          </div>
        ) : null}

        <AlertModal
          isOpen={pendingDelete != null}
          loading={removeValueMutation.isPending || deleteOptionMutation.isPending}
          title={
            pendingDelete?.kind === 'option'
              ? `Remove ${pendingDelete.label}?`
              : `Remove ${pendingDelete?.label}?`
          }
          description={
            pendingDelete?.kind === 'value' && pendingDelete.count > 0
              ? `${pendingDelete.label} is used by ${pendingDelete.count} variants. Existing orders keep their snapshots. This will remove or archive those variants.`
              : pendingDelete?.kind === 'option'
                ? `Removing ${pendingDelete.label} also removes its values and any variants that use them.`
                : 'This action cannot be undone.'
          }
          confirmLabel='Remove'
          onClose={() => setPendingDelete(null)}
          onConfirm={() => {
            if (!pendingDelete) return;
            if (pendingDelete.kind === 'value') {
              removeValueMutation.mutate({ id: pendingDelete.id, confirm: true });
              return;
            }
            deleteOptionMutation.mutate({ id: pendingDelete.id, confirm: true });
          }}
        />
      </CardContent>
    </Card>
  );
}

function ProductVariantsSection({ product }: { product: Product }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<
    Record<string, { price: number; compare: number | ''; stock: number; barcode: string }>
  >({});
  const [bulkPrice, setBulkPrice] = useState<number | ''>('');
  const [bulkStock, setBulkStock] = useState<number | ''>('');
  const [mediaFor, setMediaFor] = useState<string | null>(null);

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
    onSuccess: () => {
      toast.success('Variant saved');
    },
    onError: (error) => {
      toast.error('Failed to save variant', {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    }
  });

  const inventoryMutation = useMutation({
    ...setVariantInventoryMutation,
    onSuccess: () => toast.success('Inventory updated'),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update inventory');
    }
  });

  const deleteMutation = useMutation({
    ...deleteProductVariantMutation,
    onSuccess: () => toast.success('Variant removed'),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove variant');
    }
  });

  const mediaMutation = useMutation({
    ...setVariantMediaMutation,
    onSuccess: () => {
      setMediaFor(null);
      toast.success('Variant media updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update media');
    }
  });

  const expected = generateOptionCombinations(product.options);
  const existingKeys = new Set(
    product.variants.map((variant) =>
      variant.option_values.map((value) => value.value_id).join(':')
    )
  );
  const missing = expected.filter((combo) => !existingKeys.has(combinationKey(combo))).length;

  const selectedIds = Object.entries(selected)
    .filter(([, value]) => value)
    .map(([id]) => id);

  function draftFor(variant: Product['variants'][number]) {
    return (
      drafts[variant.id] ?? {
        price: variant.price,
        compare: variant.compare_at_price ?? '',
        stock: variant.stock_quantity,
        barcode: variant.barcode ?? ''
      }
    );
  }

  const libraryImages = useMemo(
    () => product.images.filter((image) => image.media_asset_id),
    [product.images]
  );

  return (
    <Card>
      <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-3 space-y-0'>
        <CardTitle className='text-lg'>Variants & inventory</CardTitle>
        <Button
          type='button'
          className='cursor-pointer'
          disabled={expected.length === 0 || generateMutation.isPending || !product.sku}
          isLoading={generateMutation.isPending}
          onClick={() => generateMutation.mutate(product.id)}
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
              <div className='flex flex-wrap items-end gap-2 rounded-md border p-3'>
                <p className='w-full text-sm font-medium'>{selectedIds.length} selected</p>
                <div className='space-y-1'>
                  <Label className='text-xs'>Bulk price</Label>
                  <Input
                    type='number'
                    min={0}
                    className='w-28'
                    value={bulkPrice}
                    onChange={(event) =>
                      setBulkPrice(event.target.value === '' ? '' : Number(event.target.value))
                    }
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs'>Bulk stock</Label>
                  <Input
                    type='number'
                    min={0}
                    className='w-24'
                    value={bulkStock}
                    onChange={(event) =>
                      setBulkStock(event.target.value === '' ? '' : Number(event.target.value))
                    }
                  />
                </div>
                <Button
                  type='button'
                  size='sm'
                  className='cursor-pointer'
                  disabled={upsertMutation.isPending || inventoryMutation.isPending}
                  onClick={() => {
                    void (async () => {
                      for (const id of selectedIds) {
                        const variant = product.variants.find((item) => item.id === id);
                        if (!variant) continue;
                        if (bulkPrice !== '') {
                          await upsertMutation.mutateAsync({
                            product_id: product.id,
                            variant_id: variant.id,
                            price: Number(bulkPrice),
                            compare_at_price: variant.compare_at_price,
                            option_value_ids: variant.option_values.map((value) => value.value_id),
                            stock_quantity:
                              bulkStock === '' ? variant.stock_quantity : Number(bulkStock)
                          });
                        } else if (bulkStock !== '') {
                          await inventoryMutation.mutateAsync({
                            variantId: variant.id,
                            onHand: Number(bulkStock)
                          });
                        }
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

            <ul className='space-y-3'>
              {product.variants.map((variant) => {
                const status = stockStatusLabel(variant.stock_quantity);
                const draft = draftFor(variant);
                const isSelected = Boolean(selected[variant.id]);
                return (
                  <li key={variant.id} className='space-y-3 rounded-md border px-3 py-3 text-sm'>
                    <div className='flex flex-wrap items-start justify-between gap-3'>
                      <label className='flex items-center gap-2'>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(value) =>
                            setSelected((prev) => ({ ...prev, [variant.id]: value === true }))
                          }
                        />
                        <span className='font-medium'>{variantDisplayName(variant)}</span>
                        {variant.status === 'archived' ? (
                          <StatusBadge tone='warning'>Archived</StatusBadge>
                        ) : (
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
                        )}
                      </label>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='size-8 cursor-pointer'
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(variant.id)}
                        aria-label={`Remove ${variantDisplayName(variant)}`}
                      >
                        <Icons.trash className='size-4' />
                      </Button>
                    </div>

                    <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-4'>
                      <div className='space-y-1'>
                        <Label className='text-xs'>Price</Label>
                        <Input
                          type='number'
                          min={0}
                          value={draft.price}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [variant.id]: { ...draft, price: Number(event.target.value) || 0 }
                            }))
                          }
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs'>Compare at</Label>
                        <Input
                          type='number'
                          min={0}
                          value={draft.compare}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [variant.id]: {
                                ...draft,
                                compare: event.target.value === '' ? '' : Number(event.target.value)
                              }
                            }))
                          }
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs'>Barcode</Label>
                        <Input
                          value={draft.barcode}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [variant.id]: { ...draft, barcode: event.target.value }
                            }))
                          }
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs'>Inventory</Label>
                        <Input
                          type='number'
                          min={0}
                          value={draft.stock}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [variant.id]: { ...draft, stock: Number(event.target.value) || 0 }
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className='flex flex-wrap gap-2'>
                      <Button
                        type='button'
                        size='sm'
                        className='cursor-pointer'
                        disabled={upsertMutation.isPending}
                        isLoading={upsertMutation.isPending}
                        onClick={() =>
                          upsertMutation.mutate({
                            product_id: product.id,
                            variant_id: variant.id,
                            price: draft.price,
                            compare_at_price: draft.compare === '' ? null : Number(draft.compare),
                            barcode: draft.barcode.trim() || null,
                            stock_quantity: draft.stock,
                            option_value_ids: variant.option_values.map((value) => value.value_id)
                          })
                        }
                      >
                        Save variant
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        className='cursor-pointer'
                        onClick={() => setMediaFor(mediaFor === variant.id ? null : variant.id)}
                      >
                        Media
                      </Button>
                      <p className='text-muted-foreground self-center text-xs'>
                        {formatProductPrice(variant.price)}
                      </p>
                    </div>

                    {mediaFor === variant.id ? (
                      <div className='space-y-2 rounded-md border p-3'>
                        <p className='text-xs font-medium'>Associate product images</p>
                        {libraryImages.length === 0 ? (
                          <p className='text-muted-foreground text-xs'>
                            Attach images with a media library asset first.
                          </p>
                        ) : (
                          <ul className='flex flex-wrap gap-2'>
                            {libraryImages.map((image) => {
                              const assetId = image.media_asset_id!;
                              const checked = variant.media_asset_ids.includes(assetId);
                              return (
                                <li key={image.id}>
                                  <button
                                    type='button'
                                    className='relative size-14 overflow-hidden rounded-md border'
                                    onClick={() => {
                                      const next = checked
                                        ? variant.media_asset_ids.filter((id) => id !== assetId)
                                        : [...variant.media_asset_ids, assetId];
                                      mediaMutation.mutate({
                                        variantId: variant.id,
                                        mediaAssetIds: next
                                      });
                                    }}
                                  >
                                    <Image
                                      src={image.url}
                                      alt={image.alt || product.name}
                                      fill
                                      className='object-cover'
                                      sizes='56px'
                                    />
                                    {checked ? (
                                      <span className='bg-background/80 absolute inset-0 flex items-center justify-center'>
                                        <Icons.check className='size-4' />
                                      </span>
                                    ) : null}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
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
