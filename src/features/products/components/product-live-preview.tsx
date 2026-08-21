'use client';

import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product, ProductBadge, ProductColor, ProductStatus } from '@/features/catalog/types';
import {
  colorOptionOf,
  compareApparelSizes,
  isSizeOptionName
} from '@/features/catalog/variant-engine';
import { ProductCard } from '@/features/storefront/components/product/product-card';

type ProductLivePreviewProps = {
  name: string;
  price: number | '' | null;
  compareAtPrice: number | '' | null;
  badge: ProductBadge | '' | null;
  status: ProductStatus | '' | null;
  product: Product | null;
};

const EMPTY_PREVIEW_PRODUCT: Product = {
  id: 'preview',
  slug: 'preview',
  sku: '',
  name: '',
  description: null,
  price: 0,
  compare_at_price: null,
  category_id: null,
  category_slug: null,
  category_name: null,
  product_type: null,
  badge: null,
  featured: false,
  status: 'draft',
  images: [],
  options: [],
  colors: [],
  variants: [],
  sizes: [],
  composition: null,
  care: null,
  size_fit: null,
  size_fit_image_id: null,
  size_fit_image_url: null,
  created_at: '',
  updated_at: '',
  deleted_at: null
};

function asMoney(value: number | '' | null | undefined): number | null {
  if (value === '' || value == null) return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function colorsFromOptions(product: Product): ProductColor[] {
  if (product.colors.length > 0) return product.colors;
  const colorOption = colorOptionOf(product.options);
  if (!colorOption) return [];
  return colorOption.values.map((value) => ({
    id: value.id,
    product_id: product.id,
    name: value.name,
    hex: typeof value.metadata?.hex === 'string' ? value.metadata.hex : '#111111'
  }));
}

function sizesFromProduct(product: Product): string[] {
  const fromProduct = product.sizes.length > 0 ? product.sizes : null;
  const sizeOption = product.options.find((option) => isSizeOptionName(option.name));
  const names = fromProduct ?? sizeOption?.values.map((value) => value.name) ?? [];
  return names.toSorted(compareApparelSizes);
}

function mergePreviewProduct(
  product: Product | null,
  values: Omit<ProductLivePreviewProps, 'product'>
): Product {
  const base = product ?? EMPTY_PREVIEW_PRODUCT;
  const variantPriced = base.variants.some((variant) => variant.status !== 'archived');
  return {
    ...base,
    name: values.name.trim() || 'Untitled product',
    price: variantPriced ? base.price : (asMoney(values.price) ?? base.price),
    compare_at_price: variantPriced
      ? base.compare_at_price
      : (asMoney(values.compareAtPrice) ?? base.compare_at_price),
    badge: values.badge || null,
    status: values.status || base.status,
    colors: colorsFromOptions(base),
    sizes: sizesFromProduct(base)
  };
}

export function ProductLivePreview({ product, ...values }: ProductLivePreviewProps) {
  const previewProduct = mergePreviewProduct(product, values);

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0'>
        <CardTitle className='text-base font-medium'>Live preview</CardTitle>
        {values.status ? <StatusBadge status={values.status} /> : null}
      </CardHeader>
      <CardContent className='text-sukoon-black'>
        <ProductCard product={previewProduct} preview />
      </CardContent>
    </Card>
  );
}
