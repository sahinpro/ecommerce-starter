/** Storefront presentation types — canonical catalog domain. */
export type {
  CartItem,
  Category,
  FilterOptions,
  Product,
  ProductBadge,
  ProductColor,
  ProductFilters,
  ProductImage,
  ProductsResponse,
  ProductVariant
} from '@/features/catalog/types';

export type Story = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image_url: string;
  link_text: string;
};

export type CollectionTile = {
  id: string;
  title: string;
  image_url: string;
  href: string;
  cta: string;
};

export type Benefit = {
  id: string;
  title: string;
  image_url: string;
};
