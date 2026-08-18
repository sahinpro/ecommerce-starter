import { availableQuantity } from './inventory';
import type {
  Category,
  FilterOptions,
  Product,
  ProductColor,
  ProductImage,
  ProductOption,
  ProductOptionValue,
  ProductVariant,
  ProductVariantOptionValue,
  VariantStatus
} from './types';

type CategoryJoin = { slug: string; name: string } | { slug: string; name: string }[] | null;

type OptionValueJoin = {
  id: string;
  option_id?: string;
  name: string;
  position?: number;
  metadata?: Record<string, unknown> | null;
};

type OptionJoin = {
  id: string;
  product_id?: string;
  name: string;
  position?: number;
  product_option_values?: OptionValueJoin[] | null;
};

type VariantOptionJoin = {
  option_value_id?: string;
  product_option_values?: OptionValueJoin | OptionValueJoin[] | null;
};

type VariantMediaJoin = {
  media_asset_id: string;
  sort_order?: number;
};

type VariantJoin = {
  id: string;
  product_id: string;
  sku: string;
  barcode?: string | null;
  size?: string | null;
  color_id?: string | null;
  price: number | string;
  compare_at_price?: number | string | null;
  stock_quantity?: number | string;
  status?: VariantStatus | null;
  product_variant_option_values?: VariantOptionJoin[] | null;
  product_variant_media?: VariantMediaJoin[] | null;
};

type ProductJoinRow = {
  id: string;
  slug: string;
  sku?: string | null;
  name: string;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  category_id: string | null;
  product_type: string | null;
  badge: Product['badge'];
  featured: boolean;
  status: Product['status'];
  composition: string | null;
  care: string | null;
  size_fit: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categories?: CategoryJoin;
  product_images?: ProductImage[] | null;
  product_colors?: ProductColor[] | null;
  product_options?: OptionJoin[] | null;
  product_variants?: VariantJoin[] | null;
};

function asNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
}

function firstJoin<T extends { slug: string; name: string }>(
  value: T | T[] | null | undefined
): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function optionHex(metadata: Record<string, unknown> | null | undefined): string {
  const hex = metadata?.hex;
  if (typeof hex === 'string' && /^#[0-9A-Fa-f]{6}$/i.test(hex)) return hex;
  return '#000000';
}

function asOptionValue(row: OptionValueJoin, fallbackOptionId: string): ProductOptionValue {
  return {
    id: row.id,
    option_id: row.option_id ?? fallbackOptionId,
    name: row.name,
    position: asNumber(row.position),
    metadata: row.metadata ?? null
  };
}

function mapOptions(rows: OptionJoin[] | null | undefined, productId: string): ProductOption[] {
  return (rows ?? [])
    .map((option) => ({
      id: option.id,
      product_id: option.product_id ?? productId,
      name: option.name,
      position: asNumber(option.position),
      values: (option.product_option_values ?? [])
        .map((value) => asOptionValue(value, option.id))
        .toSorted((a, b) => a.position - b.position || a.name.localeCompare(b.name))
    }))
    .toSorted((a, b) => a.position - b.position || a.name.localeCompare(b.name));
}

function mapVariantOptionValues(
  rows: VariantOptionJoin[] | null | undefined,
  options: ProductOption[]
): ProductVariantOptionValue[] {
  const optionByValueId = new Map<string, { option: ProductOption; value: ProductOptionValue }>();
  for (const option of options) {
    for (const value of option.values) {
      optionByValueId.set(value.id, { option, value });
    }
  }

  const mapped: ProductVariantOptionValue[] = [];
  for (const row of rows ?? []) {
    const nested = Array.isArray(row.product_option_values)
      ? row.product_option_values[0]
      : row.product_option_values;
    const valueId = nested?.id ?? row.option_value_id;
    if (!valueId) continue;
    const match = optionByValueId.get(valueId);
    mapped.push({
      option_id: match?.option.id ?? nested?.option_id ?? '',
      option_name: match?.option.name ?? '',
      value_id: valueId,
      value_name: match?.value.name ?? nested?.name ?? ''
    });
  }
  return mapped;
}

function variantTitle(variant: ProductVariant): string {
  if (variant.option_values.length > 0) {
    return variant.option_values.map((value) => value.value_name).join(' / ');
  }
  return [variant.size, variant.color_id].filter(Boolean).join(' / ') || variant.sku;
}

function deriveColors(
  productId: string,
  options: ProductOption[],
  variants: ProductVariant[],
  legacyColors: ProductColor[]
): ProductColor[] {
  const colorOption = options.find((option) => option.name.toLowerCase() === 'color');
  const activeValueIds = new Set(
    variants
      .filter((variant) => variant.status !== 'archived')
      .flatMap((variant) => variant.option_values.map((value) => value.value_id))
  );

  if (colorOption) {
    return colorOption.values
      .filter((value) => activeValueIds.size === 0 || activeValueIds.has(value.id))
      .map((value) => ({
        id: value.id,
        product_id: productId,
        name: value.name,
        hex: optionHex(value.metadata)
      }));
  }

  const colorIdsInVariants = new Set(
    variants
      .filter((variant) => variant.status !== 'archived')
      .map((variant) => variant.color_id)
      .filter((id): id is string => Boolean(id))
  );
  return legacyColors.filter((color) => colorIdsInVariants.has(color.id));
}

function deriveSizes(options: ProductOption[], variants: ProductVariant[]): string[] {
  const sizeOption = options.find((option) => option.name.toLowerCase() === 'size');
  const active = variants.filter((variant) => variant.status !== 'archived');
  if (sizeOption) {
    const used = new Set(
      active.flatMap((variant) =>
        variant.option_values
          .filter((value) => value.option_id === sizeOption.id)
          .map((value) => value.value_name)
      )
    );
    const names = sizeOption.values.map((value) => value.name);
    return (used.size > 0 ? names.filter((name) => used.has(name)) : names).toSorted((a, b) =>
      a.localeCompare(b)
    );
  }
  return Array.from(new Set(active.map((variant) => variant.size).filter(Boolean))).toSorted(
    (a, b) => a.localeCompare(b)
  );
}

/** Maps Supabase joined product rows → canonical Product. */
export function toCatalogProduct(row: ProductJoinRow): Product {
  const category = firstJoin(row.categories);
  const options = mapOptions(row.product_options, row.id);
  const productSku = (row.sku ?? '').trim();

  const variants: ProductVariant[] = (row.product_variants ?? []).map((variant) => {
    const optionValues = mapVariantOptionValues(variant.product_variant_option_values, options);
    const media = (variant.product_variant_media ?? [])
      .toSorted((a, b) => asNumber(a.sort_order) - asNumber(b.sort_order))
      .map((item) => item.media_asset_id)
      .filter(Boolean);
    return {
      id: variant.id,
      product_id: variant.product_id,
      sku: productSku || variant.sku,
      barcode: variant.barcode ?? null,
      size:
        variant.size ??
        optionValues.find((value) => value.option_name.toLowerCase() === 'size')?.value_name ??
        '',
      color_id:
        variant.color_id ??
        optionValues.find((value) => value.option_name.toLowerCase() === 'color')?.value_id ??
        null,
      price: asNumber(variant.price),
      compare_at_price:
        variant.compare_at_price === null || variant.compare_at_price === undefined
          ? null
          : asNumber(variant.compare_at_price),
      stock_quantity: availableQuantity(asNumber(variant.stock_quantity), 0),
      status: variant.status === 'archived' ? 'archived' : 'active',
      option_values: optionValues,
      media_asset_ids: media
    };
  });

  const activeVariants = variants.filter((variant) => variant.status !== 'archived');
  const colors = deriveColors(row.id, options, variants, row.product_colors ?? []);
  const sizes = deriveSizes(options, variants);

  const variantPrices = activeVariants.map((variant) => variant.price);
  const derivedPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : asNumber(row.price);
  const variantCompares = activeVariants
    .map((variant) => variant.compare_at_price)
    .filter((value): value is number => value != null);
  const derivedCompare =
    variantCompares.length > 0
      ? Math.min(...variantCompares)
      : row.compare_at_price === null || row.compare_at_price === undefined
        ? null
        : asNumber(row.compare_at_price);

  return {
    id: row.id,
    slug: row.slug,
    sku: productSku || variants[0]?.sku || '',
    name: row.name,
    description: row.description,
    price: derivedPrice,
    compare_at_price: derivedCompare,
    category_id: row.category_id,
    category_slug: category?.slug ?? null,
    category_name: category?.name ?? null,
    product_type: row.product_type,
    badge: row.badge,
    featured: Boolean(row.featured),
    status: row.status,
    images: (row.product_images ?? [])
      .map((image) => ({
        ...image,
        sort_order: asNumber(image.sort_order)
      }))
      .toSorted((a, b) => a.sort_order - b.sort_order),
    options,
    colors,
    variants,
    sizes,
    composition: row.composition,
    care: row.care,
    size_fit: row.size_fit,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at
  };
}

export function toCategory(row: Category): Category {
  return row;
}

export function buildFilterOptions(products: Product[]): FilterOptions {
  const sizeSet = new Set<string>();
  const typeSet = new Set<string>();
  const colorMap = new Map<string, string>();

  for (const product of products) {
    product.sizes.forEach((size) => sizeSet.add(size));
    if (product.product_type) typeSet.add(product.product_type);
    product.colors.forEach((color) => {
      if (!colorMap.has(color.name)) colorMap.set(color.name, color.hex);
    });
  }

  return {
    sizes: Array.from(sizeSet).toSorted(),
    product_types: Array.from(typeSet).toSorted(),
    colors: Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }))
  };
}

export function findVariant(
  product: Product,
  size: string,
  colorId?: string | null
): ProductVariant | undefined {
  return product.variants.find((variant) => {
    if (variant.status === 'archived') return false;
    const sizeMatch = variant.size === size;
    if (!colorId) return sizeMatch && (variant.color_id === null || product.colors.length === 0);
    return sizeMatch && variant.color_id === colorId;
  });
}

export function variantDisplayName(variant: ProductVariant): string {
  return variantTitle(variant);
}

export const PRODUCT_DETAIL_SELECT = `
  *,
  categories ( slug, name ),
  product_images ( * ),
  product_colors ( * ),
  product_options ( *, product_option_values ( * ) ),
  product_variants (
    *,
    product_variant_option_values (
      option_value_id,
      product_option_values ( id, name, position, metadata, option_id )
    ),
    product_variant_media ( media_asset_id, sort_order )
  )
`;
