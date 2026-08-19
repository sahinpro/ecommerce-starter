'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaPickerDialog } from '@/features/media';
import type { MediaAsset } from '@/features/media';
import { imageForMediaAsset } from '@/features/catalog/adapters';
import { previewOptionValueUsage } from '../api/service';
import {
  isColorOptionName,
  isSizeOptionName,
  sortSizeValues
} from '@/features/catalog/variant-engine';

import {
  patchCachedProduct,
  productWithImage,
  productWithOption,
  productWithOptionValue,
  productWithOptionValueMedia,
  productWithPrimaryImage,
  productWithUpdatedOptionValue,
  productWithoutImage,
  productWithoutOption,
  productWithoutOptionValue,
  restoreCachedProduct
} from '../api/cache';
import {
  addProductImageMutation,
  addProductOptionMutation,
  addProductOptionValueMutation,
  deleteProductImageMutation,
  deleteProductOptionMutation,
  removeProductOptionValueMutation,
  setOptionValueMediaMutation,
  setPrimaryProductImageMutation,
  updateProductOptionValueMutation
} from '../api/mutations';
import type { Product, ProductOptionValue } from '../api/types';
import { ColorSwatchPicker, hexForColorName } from './color-swatch-picker';
import { ProductVariantsSection } from './product-variants-section';

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
    onSuccess: (image) => {
      patchCachedProduct(product, (current) => productWithImage(current, image));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add image');
    }
  });

  const deleteMutation = useMutation({
    ...deleteProductImageMutation,
    onMutate: (imageId) => {
      const snapshot = patchCachedProduct(product, (current) =>
        productWithoutImage(current, imageId)
      );
      return { snapshot };
    },
    onSuccess: () => toast.success('Image detached (kept in media library)'),
    onError: (error, _imageId, context) => {
      restoreCachedProduct(product, context?.snapshot);
      toast.error(error instanceof Error ? error.message : 'Failed to remove image');
    }
  });

  const primaryMutation = useMutation({
    ...setPrimaryProductImageMutation,
    onMutate: ({ imageId }) => {
      const snapshot = patchCachedProduct(product, (current) =>
        productWithPrimaryImage(current, imageId)
      );
      return { snapshot };
    },
    onSuccess: () => toast.success('Primary image updated'),
    onError: (error, _vars, context) => {
      restoreCachedProduct(product, context?.snapshot);
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
    onSuccess: (option) => {
      patchCachedProduct(product, (current) => productWithOption(current, option));
      setOptionName('');
      toast.success('Option added');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add option');
    }
  });

  const addValueMutation = useMutation({
    ...addProductOptionValueMutation,
    onSuccess: (value, variables) => {
      patchCachedProduct(product, (current) =>
        productWithOptionValue(current, variables.option_id, value, variables.hex)
      );
      setValueDrafts((prev) => ({
        ...prev,
        [variables.option_id]: { name: '', hex: '#111111' }
      }));
      toast.success('Value added');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add value');
    }
  });

  const removeValueMutation = useMutation({
    ...removeProductOptionValueMutation,
    onMutate: ({ id }) => {
      const snapshot = patchCachedProduct(product, (current) =>
        productWithoutOptionValue(current, id)
      );
      return { snapshot };
    },
    onSuccess: (result) => {
      setPendingDelete(null);
      const extra =
        result.removed_variants + result.archived_variants > 0
          ? ` ${result.removed_variants} removed, ${result.archived_variants} archived.`
          : '';
      toast.success(`Value removed.${extra}`);
    },
    onError: (error, _vars, context) => {
      restoreCachedProduct(product, context?.snapshot);
      toast.error(error instanceof Error ? error.message : 'Failed to remove value');
    }
  });

  const deleteOptionMutation = useMutation({
    ...deleteProductOptionMutation,
    onMutate: ({ id }) => {
      const snapshot = patchCachedProduct(product, (current) => productWithoutOption(current, id));
      return { snapshot };
    },
    onSuccess: () => {
      setPendingDelete(null);
      toast.success('Option removed');
    },
    onError: (error, _vars, context) => {
      restoreCachedProduct(product, context?.snapshot);
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
          Up to 3 options. Color photos are uploaded once per color and shared by every size.
        </p>

        {product.options.length > 0 ? (
          <div className='space-y-4'>
            {product.options.map((option) => {
              const draft = valueDrafts[option.id] ?? { name: '', hex: '#111111' };
              const isColor = isColorOptionName(option.name);
              const values = isSizeOptionName(option.name)
                ? sortSizeValues(option.values)
                : option.values;
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
                  {isColor ? (
                    <ul className='space-y-3'>
                      {values.map((value) => (
                        <ColorValueRow
                          key={value.id}
                          product={product}
                          value={value}
                          onRemove={() => void requestDeleteValue(value.id, value.name)}
                        />
                      ))}
                    </ul>
                  ) : (
                    <ul className='flex flex-wrap gap-2'>
                      {values.map((value) => (
                        <li
                          key={value.id}
                          className='flex items-center gap-2 rounded-full border px-3 py-1 text-sm'
                        >
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
                      ))}
                    </ul>
                  )}
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                    <Input
                      value={draft.name}
                      placeholder={isColor ? 'Cream' : 'Add value'}
                      className='sm:flex-1'
                      onChange={(event) => {
                        const name = event.target.value;
                        const presetHex = isColor ? hexForColorName(name) : null;
                        setValueDrafts((prev) => ({
                          ...prev,
                          [option.id]: {
                            name,
                            hex: presetHex ?? draft.hex
                          }
                        }));
                      }}
                    />
                    {isColor ? (
                      <ColorSwatchPicker
                        value={draft.hex}
                        onChange={(hex) =>
                          setValueDrafts((prev) => ({
                            ...prev,
                            [option.id]: { ...draft, hex }
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

function ColorValueRow({
  product,
  value,
  onRemove
}: {
  product: Product;
  value: ProductOptionValue;
  onRemove: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const hex = typeof value.metadata?.hex === 'string' ? value.metadata.hex : '#111111';

  const addImageMutation = useMutation({
    ...addProductImageMutation,
    onSuccess: (image) => {
      patchCachedProduct(product, (current) => productWithImage(current, image));
    },
    onError: (error) => {
      if (error instanceof Error && error.message.includes('already attached')) return;
      toast.error(error instanceof Error ? error.message : 'Failed to add image');
    }
  });

  const hexMutation = useMutation({
    ...updateProductOptionValueMutation,
    onMutate: ({ hex: nextHex }) => {
      const snapshot = patchCachedProduct(product, (current) =>
        productWithUpdatedOptionValue(current, value.id, { hex: nextHex })
      );
      return { snapshot };
    },
    onError: (error, _vars, context) => {
      restoreCachedProduct(product, context?.snapshot);
      toast.error(error instanceof Error ? error.message : 'Failed to update color');
    }
  });

  const mediaMutation = useMutation({
    ...setOptionValueMediaMutation,
    onMutate: ({ mediaAssetIds }) => {
      const snapshot = patchCachedProduct(product, (current) =>
        productWithOptionValueMedia(current, value.id, mediaAssetIds)
      );
      return { snapshot };
    },
    onSuccess: () => toast.success(`${value.name} photos updated`),
    onError: (error, _vars, context) => {
      restoreCachedProduct(product, context?.snapshot);
      toast.error(error instanceof Error ? error.message : 'Failed to update color photos');
    }
  });

  async function ensureProductImages(assets: MediaAsset[]) {
    let sortOrder = product.images.length;
    for (const asset of assets) {
      const alreadyOnProduct = product.images.some((image) => image.media_asset_id === asset.id);
      if (alreadyOnProduct) continue;
      try {
        await addImageMutation.mutateAsync({
          product_id: product.id,
          url: asset.url,
          public_id: asset.public_id,
          alt: asset.alt || `${product.name} ${value.name}`,
          sort_order: sortOrder,
          media_asset_id: asset.id
        });
        sortOrder += 1;
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes('already attached')) {
          throw error;
        }
      }
    }
  }

  return (
    <li className='space-y-2 rounded-md border px-3 py-2'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex min-w-0 flex-1 flex-wrap items-center gap-2'>
          <span className='text-sm font-medium'>{value.name}</span>
          <ColorSwatchPicker
            value={hex}
            disabled={hexMutation.isPending}
            onChange={(nextHex) =>
              hexMutation.mutate({
                value_id: value.id,
                hex: nextHex
              })
            }
          />
        </div>
        <button
          type='button'
          className='text-muted-foreground hover:text-foreground cursor-pointer'
          aria-label={`Remove ${value.name}`}
          onClick={onRemove}
        >
          <Icons.close className='size-3.5' />
        </button>
      </div>
      <ul className='flex flex-wrap items-center gap-2'>
        {value.media_asset_ids.map((assetId) => {
          const image = imageForMediaAsset(product, assetId);
          return (
            <li key={assetId} className='relative'>
              <span className='relative block size-12 overflow-hidden rounded-md border'>
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.alt || value.name}
                    fill
                    className='object-cover'
                    sizes='48px'
                  />
                ) : (
                  <span className='bg-muted absolute inset-0' />
                )}
              </span>
              <button
                type='button'
                className='bg-background absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full border'
                aria-label={`Remove photo from ${value.name}`}
                disabled={mediaMutation.isPending}
                onClick={() =>
                  mediaMutation.mutate({
                    optionValueId: value.id,
                    mediaAssetIds: value.media_asset_ids.filter((id) => id !== assetId)
                  })
                }
              >
                <Icons.close className='size-3' />
              </button>
            </li>
          );
        })}
        <li>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-12 cursor-pointer px-2 text-xs'
            onClick={() => setPickerOpen(true)}
          >
            <Icons.media className='size-3.5' />
            Photos
          </Button>
        </li>
      </ul>
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        excludePublicIds={product.images
          .filter(
            (image) => image.media_asset_id && value.media_asset_ids.includes(image.media_asset_id)
          )
          .map((image) => image.public_id)
          .filter((id): id is string => Boolean(id))}
        onSelect={(assets) => {
          void (async () => {
            try {
              await ensureProductImages(assets);
              const nextIds = [...value.media_asset_ids];
              for (const asset of assets) {
                if (!nextIds.includes(asset.id)) nextIds.push(asset.id);
              }
              await mediaMutation.mutateAsync({
                optionValueId: value.id,
                mediaAssetIds: nextIds
              });
            } catch {
              // toasts from mutation onError
            }
          })();
        }}
      />
    </li>
  );
}
