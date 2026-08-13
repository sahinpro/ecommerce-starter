import type {
  Category,
  FilterOptions,
  Product,
  ProductColor,
  ProductImage,
  ProductVariant
} from './types';

type CategoryJoin = { slug: string; name: string } | { slug: string; name: string }[] | null;

type ProductJoinRow = {
  id: string;
  slug: string;
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
  product_variants?: ProductVariant[] | null;
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

/** Maps Supabase joined product rows → canonical Product. */
export function toCatalogProduct(row: ProductJoinRow): Product {
  const category = firstJoin(row.categories);
  const variants = (row.product_variants ?? []).map((variant) => ({
    ...variant,
    price: asNumber(variant.price),
    compare_at_price:
      variant.compare_at_price === null || variant.compare_at_price === undefined
        ? null
        : asNumber(variant.compare_at_price),
    stock_quantity: asNumber(variant.stock_quantity)
  }));

  const sizes = Array.from(new Set(variants.map((v) => v.size))).sort((a, b) => a.localeCompare(b));

  // Only expose colors that are used by at least one variant (ignore orphan color rows).
  const colorIdsInVariants = new Set(
    variants.map((variant) => variant.color_id).filter((id): id is string => Boolean(id))
  );
  const colors = (row.product_colors ?? []).filter((color) => colorIdsInVariants.has(color.id));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: asNumber(row.price),
    compare_at_price:
      row.compare_at_price === null || row.compare_at_price === undefined
        ? null
        : asNumber(row.compare_at_price),
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
      .sort((a, b) => a.sort_order - b.sort_order),
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
    sizes: Array.from(sizeSet).sort(),
    product_types: Array.from(typeSet).sort(),
    colors: Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }))
  };
}

export function findVariant(
  product: Product,
  size: string,
  colorId?: string | null
): ProductVariant | undefined {
  return product.variants.find((variant) => {
    const sizeMatch = variant.size === size;
    if (!colorId) return sizeMatch && (variant.color_id === null || product.colors.length === 0);
    return sizeMatch && variant.color_id === colorId;
  });
}

export const PRODUCT_DETAIL_SELECT = `
  *,
  categories ( slug, name ),
  product_images ( * ),
  product_colors ( * ),
  product_variants ( * )
`;
