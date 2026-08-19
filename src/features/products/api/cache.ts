import { catalogKeys } from '@/features/catalog/queries';
import { isColorOptionName } from '@/features/catalog/variant-engine';
import { getQueryClient } from '@/lib/query-client';

import type { Product, ProductImage, ProductOption, ProductOptionValue } from './types';

function keysFor(product: Pick<Product, 'id' | 'slug'>) {
  return [catalogKeys.product(product.id), catalogKeys.product(product.slug)] as const;
}

export function patchCachedProduct(
  product: Pick<Product, 'id' | 'slug'>,
  updater: (current: Product) => Product
): Product | undefined {
  const client = getQueryClient();
  let snapshot: Product | undefined;

  for (const key of keysFor(product)) {
    const current = client.getQueryData<Product | null>(key);
    if (!current) continue;
    snapshot ??= current;
    client.setQueryData(key, updater(current));
  }

  return snapshot;
}

export function restoreCachedProduct(
  product: Pick<Product, 'id' | 'slug'>,
  snapshot: Product | undefined
): void {
  if (!snapshot) return;
  const client = getQueryClient();
  for (const key of keysFor(product)) {
    client.setQueryData(key, snapshot);
  }
}

function hexFromValue(value: ProductOptionValue, fallback = '#111111'): string {
  return typeof value.metadata?.hex === 'string' ? value.metadata.hex : fallback;
}

export function productWithOption(current: Product, option: ProductOption): Product {
  return { ...current, options: [...current.options, option] };
}

export function productWithOptionValue(
  current: Product,
  optionId: string,
  value: ProductOptionValue,
  hex?: string | null
): Product {
  const option = current.options.find((item) => item.id === optionId);
  const resolvedHex = hex ?? hexFromValue(value);
  const alreadyPresent = option?.values.some((item) => item.id === value.id);

  return {
    ...current,
    options: current.options.map((item) =>
      item.id === optionId
        ? {
            ...item,
            values: alreadyPresent ? item.values : [...item.values, value]
          }
        : item
    ),
    colors:
      option &&
      isColorOptionName(option.name) &&
      !current.colors.some((color) => color.id === value.id)
        ? [
            ...current.colors,
            {
              id: value.id,
              product_id: current.id,
              name: value.name,
              hex: resolvedHex
            }
          ]
        : current.colors
  };
}

export function productWithUpdatedOptionValue(
  current: Product,
  valueId: string,
  patch: { name?: string; hex?: string | null }
): Product {
  return {
    ...current,
    options: current.options.map((option) => ({
      ...option,
      values: option.values.map((value) => {
        if (value.id !== valueId) return value;
        const metadata = { ...(value.metadata ?? {}) };
        if (patch.hex !== undefined) {
          if (patch.hex) metadata.hex = patch.hex;
          else delete metadata.hex;
        }
        return {
          ...value,
          name: patch.name ?? value.name,
          metadata: Object.keys(metadata).length > 0 ? metadata : null
        };
      })
    })),
    colors: current.colors.map((color) =>
      color.id === valueId
        ? {
            ...color,
            name: patch.name ?? color.name,
            hex: patch.hex ?? color.hex
          }
        : color
    )
  };
}

export function productWithOptionValueMedia(
  current: Product,
  valueId: string,
  mediaAssetIds: string[]
): Product {
  return {
    ...current,
    options: current.options.map((option) => ({
      ...option,
      values: option.values.map((value) =>
        value.id === valueId ? { ...value, media_asset_ids: mediaAssetIds } : value
      )
    }))
  };
}

export function productWithoutOptionValue(current: Product, valueId: string): Product {
  return {
    ...current,
    options: current.options.map((option) => ({
      ...option,
      values: option.values.filter((value) => value.id !== valueId)
    })),
    colors: current.colors.filter((color) => color.id !== valueId),
    variants: current.variants.filter(
      (variant) =>
        variant.color_id !== valueId &&
        !variant.option_values.some((value) => value.value_id === valueId)
    )
  };
}

export function productWithoutOption(current: Product, optionId: string): Product {
  const removedValueIds = new Set(
    current.options.find((option) => option.id === optionId)?.values.map((value) => value.id) ?? []
  );

  return {
    ...current,
    options: current.options.filter((option) => option.id !== optionId),
    colors: current.colors.filter((color) => !removedValueIds.has(color.id)),
    variants: current.variants.filter(
      (variant) =>
        !variant.option_values.some(
          (value) => value.option_id === optionId || removedValueIds.has(value.value_id)
        )
    )
  };
}

export function productWithImage(current: Product, image: ProductImage): Product {
  if (current.images.some((item) => item.id === image.id)) return current;
  return { ...current, images: [...current.images, image] };
}

export function productWithoutImage(current: Product, imageId: string): Product {
  return { ...current, images: current.images.filter((image) => image.id !== imageId) };
}

export function productWithPrimaryImage(current: Product, imageId: string): Product {
  const next = current.images.find((image) => image.id === imageId);
  if (!next) return current;
  return {
    ...current,
    images: [next, ...current.images.filter((image) => image.id !== imageId)]
  };
}

export function productWithoutVariant(current: Product, variantId: string): Product {
  return {
    ...current,
    variants: current.variants.filter((variant) => variant.id !== variantId)
  };
}
