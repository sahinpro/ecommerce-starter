import type { SupabaseClient } from '@supabase/supabase-js';

import { createSupabaseAnonClient } from '@/lib/supabase/anon';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

import { buildFilterOptions, PRODUCT_DETAIL_SELECT, toCatalogProduct } from './adapters';
import { getCollectionNavChildren } from './figma-taxonomy';
import { categoryMutationSchema } from './schemas/category';
import {
  productImageMutationSchema,
  productMutationSchema,
  productVariantMutationSchema
} from './schemas/product';
import type {
  Category,
  CategoryMutationPayload,
  FilterOptions,
  NavChildLink,
  Product,
  ProductColorMutationPayload,
  ProductFilters,
  ProductImage,
  ProductImageMutationPayload,
  ProductMutationPayload,
  ProductsResponse,
  ProductVariant,
  ProductVariantMutationPayload
} from './types';

/**
 * Resolve a Supabase client without importing next/headers.
 * - Browser: session-aware anon client (staff mutations work via RLS)
 * - Server (RSC / prefetch in shared modules): cookie-free anon client
 *
 * Staff-only dashboard lists that run in Client Components still see drafts
 * because the browser client carries the auth session.
 */
function getSupabase(): SupabaseClient {
  if (typeof window === 'undefined') {
    return createSupabaseAnonClient();
  }
  return createSupabaseBrowserClient();
}

function catalogError(message: string, cause?: unknown): Error {
  if (cause && typeof cause === 'object' && 'message' in cause) {
    return new Error(`${message}: ${String((cause as { message: unknown }).message)}`);
  }
  return new Error(message);
}

function slugifyLabel(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Strip PostgREST `or()` / ilike metacharacters so user input cannot break the filter. */
function sanitizeSearchTerm(value: string): string | null {
  const cleaned = value
    .replace(/[%_\\,()*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned : null;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw catalogError('Failed to list categories', error);
  return (data ?? []) as Category[];
}

export type AdminCategory = Category & { product_count: number };

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const supabase = getSupabase();
  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('products').select('category_id').is('deleted_at', null)
  ]);

  if (categoriesResult.error) {
    throw catalogError('Failed to list categories', categoriesResult.error);
  }
  if (productsResult.error) {
    throw catalogError('Failed to count category products', productsResult.error);
  }

  const counts = new Map<string, number>();
  for (const row of productsResult.data ?? []) {
    const categoryId = (row as { category_id: string | null }).category_id;
    if (!categoryId) continue;
    counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
  }

  return ((categoriesResult.data ?? []) as Category[]).map((category) => ({
    ...category,
    product_count: counts.get(category.id) ?? 0
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw catalogError('Failed to load category', error);
  return (data as Category | null) ?? null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('categories').select('*').eq('id', id).maybeSingle();
  if (error) throw catalogError('Failed to load category', error);
  return (data as Category | null) ?? null;
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 24));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = getSupabase();
  let query = supabase
    .from('products')
    .select(PRODUCT_DETAIL_SELECT, { count: 'exact' })
    .range(from, to);

  if (!filters.includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const status = filters.status ?? 'active';
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters.category && filters.category !== 'all') {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.category)
      .maybeSingle();

    if (categoryError) throw catalogError('Failed to resolve category', categoryError);
    if (!category) {
      return { products: [], total: 0, page, limit };
    }
    query = query.eq('category_id', category.id);
  }

  if (filters.product_types?.length) {
    query = query.in('product_type', filters.product_types);
  }

  const searchTerm = sanitizeSearchTerm(filters.search ?? '');
  if (searchTerm) {
    query = query.or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,product_type.ilike.%${searchTerm}%`
    );
  }

  switch (filters.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'name_asc':
      query = query.order('name', { ascending: true });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error, count } = await query;
  if (error) throw catalogError('Failed to list products', error);

  let products = (data ?? []).map((row) =>
    toCatalogProduct(row as Parameters<typeof toCatalogProduct>[0])
  );

  // Client-side refinement for size/color (variant-level) on the current page set.
  // For small catalogs this is acceptable; scale later with RPC if needed.
  if (filters.sizes?.length) {
    products = products.filter((product) =>
      product.sizes.some((size) => filters.sizes!.includes(size))
    );
  }
  if (filters.colors?.length) {
    products = products.filter((product) =>
      product.colors.some((color) => filters.colors!.includes(color.name))
    );
  }

  return {
    products,
    total: count ?? products.length,
    page,
    limit
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_DETAIL_SELECT)
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw catalogError('Failed to load product', error);
  if (!data) return null;
  return toCatalogProduct(data as Parameters<typeof toCatalogProduct>[0]);
}

export async function getActiveProductSlugs(): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('slug')
    .eq('status', 'active')
    .is('deleted_at', null);

  if (error) throw catalogError('Failed to list product slugs', error);
  return (data ?? [])
    .map((row) => row.slug)
    .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_DETAIL_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw catalogError('Failed to load product', error);
  if (!data) return null;
  return toCatalogProduct(data as Parameters<typeof toCatalogProduct>[0]);
}

/**
 * Resolve dashboard/admin product routes by slug (preferred) or id (legacy URLs).
 */
export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  const key = idOrSlug.trim();
  if (!key) return null;

  const bySlug = await getProductBySlug(key);
  if (bySlug) return bySlug;

  return getProductById(key);
}

/** Active products by id — used by guest wishlist drawer. */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_DETAIL_SELECT)
    .in('id', ids)
    .eq('status', 'active')
    .is('deleted_at', null);

  if (error) throw catalogError('Failed to load products by id', error);

  const products = (data ?? []).map((row) =>
    toCatalogProduct(row as Parameters<typeof toCatalogProduct>[0])
  );
  const byId = new Map(products.map((product) => [product.id, product]));
  return ids.map((id) => byId.get(id)).filter((product): product is Product => Boolean(product));
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const result = await getProducts({ featured: true, status: 'active', limit, sort: 'newest' });
  return result.products;
}

export async function getNewArrivals(limit = 12): Promise<Product[]> {
  const result = await getProducts({
    status: 'active',
    limit,
    sort: 'newest',
    featured: true
  });
  return result.products;
}

export async function getProductsByCategory(
  categorySlug: string,
  filters: Omit<ProductFilters, 'category'> = {}
): Promise<ProductsResponse> {
  return getProducts({ ...filters, category: categorySlug });
}

export async function getRelatedProducts(
  productId: string,
  categorySlug: string,
  limit = 4
): Promise<Product[]> {
  const result = await getProducts({
    category: categorySlug,
    status: 'active',
    limit: limit + 4,
    sort: 'newest'
  });
  return result.products.filter((product) => product.id !== productId).slice(0, limit);
}

export async function getFilterOptions(categorySlug?: string): Promise<FilterOptions> {
  const result = await getProducts({
    category: categorySlug && categorySlug !== 'all' ? categorySlug : undefined,
    status: 'active',
    limit: 100,
    sort: 'newest'
  });
  return buildFilterOptions(result.products);
}

/** Secondary nav: Shop All + static collection product types. */
export async function getCategoryNavChildren(categorySlug: string): Promise<NavChildLink[]> {
  return getCollectionNavChildren(categorySlug);
}

export async function createCategory(input: CategoryMutationPayload): Promise<Category> {
  const payload = categoryMutationSchema.parse(input);
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: payload.name,
      slug: payload.slug,
      image_url: payload.image_url ?? null,
      image_public_id: payload.image_public_id ?? null,
      sort_order: payload.sort_order ?? 0
    })
    .select('*')
    .single();

  if (error) throw catalogError('Failed to create category', error);
  return data as Category;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryMutationPayload>
): Promise<Category> {
  const payload = categoryMutationSchema.partial().parse(input);
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw catalogError('Failed to update category', error);
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw catalogError('Failed to delete category', error);
}

export async function createProduct(input: ProductMutationPayload): Promise<Product> {
  const payload = productMutationSchema.parse(input);
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: payload.name,
      slug: payload.slug || slugifyLabel(payload.name),
      description: payload.description ?? null,
      price: payload.price,
      compare_at_price: payload.compare_at_price ?? null,
      category_id: payload.category_id ?? null,
      product_type: payload.product_type ?? null,
      badge: payload.badge ?? null,
      featured: payload.featured ?? false,
      status: payload.status ?? 'draft',
      composition: payload.composition ?? null,
      care: payload.care ?? null,
      size_fit: payload.size_fit ?? null
    })
    .select(PRODUCT_DETAIL_SELECT)
    .single();

  if (error) throw catalogError('Failed to create product', error);
  return toCatalogProduct(data as Parameters<typeof toCatalogProduct>[0]);
}

export async function updateProduct(
  id: string,
  input: Partial<ProductMutationPayload>
): Promise<Product> {
  const payload = productMutationSchema.partial().parse(input);
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select(PRODUCT_DETAIL_SELECT)
    .single();

  if (error) throw catalogError('Failed to update product', error);
  return toCatalogProduct(data as Parameters<typeof toCatalogProduct>[0]);
}

export async function archiveProduct(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('products')
    .update({ status: 'archived', deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw catalogError('Failed to archive product', error);
}

export async function addProductImage(input: ProductImageMutationPayload): Promise<ProductImage> {
  const payload = productImageMutationSchema.parse(input);
  const supabase = getSupabase();

  if (payload.public_id) {
    const { data: existing } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', payload.product_id)
      .eq('public_id', payload.public_id)
      .maybeSingle();
    if (existing) {
      throw new Error('This image is already attached to the product.');
    }
  }

  const { data, error } = await supabase
    .from('product_images')
    .insert({
      product_id: payload.product_id,
      url: payload.url,
      public_id: payload.public_id ?? null,
      alt: payload.alt ?? null,
      sort_order: payload.sort_order ?? 0,
      media_asset_id: payload.media_asset_id ?? null
    })
    .select('*')
    .single();

  if (error) throw catalogError('Failed to add product image', error);
  return data as ProductImage;
}

/** Make image primary (sort_order 0); shift peers. */
export async function setPrimaryProductImage(productId: string, imageId: string): Promise<void> {
  const supabase = getSupabase();
  const { data: images, error } = await supabase
    .from('product_images')
    .select('id')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true });

  if (error) throw catalogError('Failed to load product images', error);
  const rows = images ?? [];
  if (!rows.some((row) => row.id === imageId)) {
    throw new Error('Image not found on this product.');
  }

  const ordered = [imageId, ...rows.map((row) => row.id).filter((id) => id !== imageId)];
  for (let index = 0; index < ordered.length; index += 1) {
    const { error: updateError } = await supabase
      .from('product_images')
      .update({ sort_order: index })
      .eq('id', ordered[index]!);
    if (updateError) throw catalogError('Failed to set primary image', updateError);
  }
}

export async function deleteProductImage(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('product_images').delete().eq('id', id);
  if (error) throw catalogError('Failed to delete product image', error);
}

export async function addProductColor(input: ProductColorMutationPayload) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('product_colors')
    .insert({
      product_id: input.product_id,
      name: input.name,
      hex: input.hex
    })
    .select('*')
    .single();

  if (error) throw catalogError('Failed to add product color', error);
  return data;
}

export async function deleteProductColor(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('product_colors').delete().eq('id', id);
  if (error) throw catalogError('Failed to delete product color', error);
}

export async function upsertProductVariant(
  input: ProductVariantMutationPayload
): Promise<ProductVariant> {
  const payload = productVariantMutationSchema.parse(input);
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('product_variants')
    .upsert(
      {
        product_id: payload.product_id,
        sku: payload.sku,
        size: payload.size,
        color_id: payload.color_id ?? null,
        price: payload.price,
        compare_at_price: payload.compare_at_price ?? null,
        stock_quantity: payload.stock_quantity ?? 0
      },
      { onConflict: 'sku' }
    )
    .select('*')
    .single();

  if (error) throw catalogError('Failed to save variant', error);
  return data as ProductVariant;
}

export async function deleteProductVariant(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('product_variants').delete().eq('id', id);
  if (error) throw catalogError('Failed to delete variant', error);
}

/** Admin list — includes drafts/archived when status=all */
export async function getAdminProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  return getProducts({
    ...filters,
    status: filters.status ?? 'all',
    includeDeleted: filters.includeDeleted ?? false
  });
}
