/**
 * Canonical Sukoon catalog domain model (single source of truth).
 * Dashboard + storefront consume this layer — do not fork Product types.
 */

export type ProductBadge = 'new' | 'best_seller' | 'back_in_stock' | 'sale';

export type ProductStatus = 'active' | 'draft' | 'archived';

export type Category = {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  image_public_id: string | null;
  sort_order: number;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  public_id: string | null;
  alt: string | null;
  sort_order: number;
  media_asset_id?: string | null;
};

export type ProductColor = {
  id: string;
  product_id: string;
  name: string;
  hex: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  color_id: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  /** Derived from join — not a DB column */
  category_slug: string | null;
  /** Derived from join — not a DB column */
  category_name: string | null;
  product_type: string | null;
  badge: ProductBadge | null;
  featured: boolean;
  status: ProductStatus;
  images: ProductImage[];
  colors: ProductColor[];
  variants: ProductVariant[];
  /** Derived unique sizes from variants for presentation */
  sizes: string[];
  composition: string | null;
  care: string | null;
  size_fit: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CartItem = {
  id: string;
  product_id: string;
  variant_id: string;
  slug: string;
  name: string;
  size: string;
  color: string;
  color_hex: string;
  price: number;
  quantity: number;
  image_url: string;
};

export type ProductFilters = {
  category?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sizes?: string[];
  colors?: string[];
  product_types?: string[];
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
  status?: ProductStatus | 'all';
  featured?: boolean;
  includeDeleted?: boolean;
  view?: 'grid' | 'catalogue';
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
};

export type FilterOptions = {
  sizes: string[];
  colors: { name: string; hex: string }[];
  product_types: string[];
};

export type CategoryMutationPayload = {
  name: string;
  slug: string;
  image_url?: string | null;
  image_public_id?: string | null;
  sort_order?: number;
};

export type ProductMutationPayload = {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  category_id?: string | null;
  product_type?: string | null;
  badge?: ProductBadge | null;
  featured?: boolean;
  status?: ProductStatus;
  composition?: string | null;
  care?: string | null;
  size_fit?: string | null;
};

export type ProductImageMutationPayload = {
  product_id: string;
  url: string;
  public_id?: string | null;
  alt?: string | null;
  sort_order?: number;
  media_asset_id?: string | null;
};

export type ProductColorMutationPayload = {
  product_id: string;
  name: string;
  hex: string;
};

export type ProductVariantMutationPayload = {
  product_id: string;
  sku: string;
  size: string;
  color_id?: string | null;
  price: number;
  compare_at_price?: number | null;
  stock_quantity?: number;
};

export type NavChildLink = {
  label: string;
  href: string;
};

export type NavPrimaryItem = {
  id?: string;
  label: string;
  href: string;
  /** Category slug used to resolve secondary links from product_types */
  categorySlug?: string;
  blurb?: string;
  children?: NavChildLink[];
};
