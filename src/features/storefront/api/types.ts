/** Mirrors Supabase schema — keep in sync with supabase/schema.sql */

export type ProductBadge = 'new' | 'best_seller' | 'back_in_stock' | 'sale' | null;

export type Category = {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  sort_order: number;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  sort_order: number;
};

export type ProductColor = {
  id: string;
  name: string;
  hex: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  color_id: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category_id: string;
  category_slug: string;
  product_type: string;
  badge: ProductBadge;
  featured: boolean;
  status: 'active' | 'draft';
  images: ProductImage[];
  colors: ProductColor[];
  sizes: string[];
  composition: string;
  care: string;
  size_fit: string;
  created_at: string;
  updated_at: string;
};

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

export type ProductFilters = {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sizes?: string[];
  colors?: string[];
  product_types?: string[];
  sort?: 'newest' | 'price_asc' | 'price_desc';
  view?: 'grid' | 'catalogue';
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
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

export type FilterOptions = {
  sizes: string[];
  colors: { name: string; hex: string }[];
  product_types: string[];
};
