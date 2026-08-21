import { findVariant } from '@/features/catalog/adapters';

import type { Product, ProductColor } from '../api/types';

/** First in-stock variant so wishlist items can go to cart without picking options. */
export function firstInStockCartSelection(product: Product): {
  size: string;
  color: ProductColor;
} | null {
  const variant = product.variants.find(
    (item) => item.status === 'active' && item.stock_quantity >= 1
  );
  if (!variant) return null;

  const color: ProductColor = product.colors.find((item) => item.id === variant.color_id) ?? {
    id: variant.color_id ?? '',
    product_id: product.id,
    name:
      variant.option_values.find((value) => value.value_id === variant.color_id)?.value_name ?? '',
    hex: '#111111'
  };

  const matched = findVariant(product, variant.size, color.id || undefined);
  if (!matched || matched.stock_quantity < 1) return null;

  return { size: variant.size, color };
}
