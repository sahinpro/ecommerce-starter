import type { SupabaseClient } from '@supabase/supabase-js';

import { createSupabaseAnonClient } from '@/lib/supabase/anon';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

import {
  buildFilterOptions,
  PRODUCT_DETAIL_SELECT,
  PRODUCT_DETAIL_SELECT_LEGACY,
  toCatalogProduct
} from './adapters';
import { getCollectionNavChildren } from './figma-taxonomy';
import { categoryMutationSchema } from './schemas/category';
import {
  productImageMutationSchema,
  productMutationSchema,
  productOptionMutationSchema,
  productOptionValueMutationSchema,
  productVariantMutationSchema
} from './schemas/product';
import type {
  Category,
  CategoryMutationPayload,
  FilterOptions,
  GenerateVariantsResult,
  InventoryAdjustment,
  NavChildLink,
  Product,
  ProductColorMutationPayload,
  ProductFilters,
  ProductImage,
  ProductImageMutationPayload,
  ProductMutationPayload,
  ProductOption,
  ProductOptionMutationPayload,
  ProductOptionValue,
  ProductOptionValueMutationPayload,
  ProductVariant,
  ProductVariantMutationPayload,
  ProductsResponse,
  RemoveOptionValueResult
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

function mapRpcMessage(message: string): string {
  if (message.startsWith('OPTION_VALUE_IN_USE:')) {
    const count = message.split(':')[1] ?? 'some';
    return `${count} variants use this value. Confirm to remove or archive them.`;
  }
  if (message.includes('INSUFFICIENT_STOCK') || /insufficient stock for variant/i.test(message)) {
    return 'This item just sold out — please remove it and try again';
  }
  if (
    message.includes('products_sku_uidx') ||
    (message.includes('duplicate key') && message.toLowerCase().includes('sku'))
  ) {
    return 'That SKU is already used by another product.';
  }
  if (message.includes('Set a product SKU')) {
    return 'Set a product SKU before creating variants.';
  }
  if (
    message.includes('product_variants_active_combination') ||
    message.includes('product_variants_unique_combo')
  ) {
    return 'That option combination already exists.';
  }
  if (message.includes('product_options_product_id_name')) {
    return 'That option name already exists on this product.';
  }
  if (message.includes('product_option_values') && message.includes('unique')) {
    return 'That option value already exists.';
  }
  return message;
}

function catalogWriteError(fallback: string, error: { message: string }): Error {
  const mapped = mapRpcMessage(error.message);
  if (mapped !== error.message) return catalogError(mapped, error);
  return catalogError(fallback, error);
}

async function catalogRpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc(name as never, args as never);
  if (error) throw catalogError(mapRpcMessage(error.message), error);
  return data as T;
}

let cachedProductDetailSelect: string | null = null;

function isMissingOptionValueMedia(message: string): boolean {
  return (
    message.includes('product_option_value_media') &&
    (message.includes('Could not find a relationship') || message.includes('does not exist'))
  );
}

async function productDetailSelect(): Promise<typeof PRODUCT_DETAIL_SELECT> {
  if (cachedProductDetailSelect) {
    return cachedProductDetailSelect as typeof PRODUCT_DETAIL_SELECT;
  }
  const supabase = getSupabase();
  const { error } = await supabase.from('products').select(PRODUCT_DETAIL_SELECT).limit(1);
  if (!error) {
    cachedProductDetailSelect = PRODUCT_DETAIL_SELECT;
    return PRODUCT_DETAIL_SELECT;
  }
  if (isMissingOptionValueMedia(error.message)) {
    cachedProductDetailSelect = PRODUCT_DETAIL_SELECT_LEGACY;
    return PRODUCT_DETAIL_SELECT_LEGACY as typeof PRODUCT_DETAIL_SELECT;
  }
  throw catalogError('Failed to load product', error);
}

function isMissingSizeFitImageColumn(message: string): boolean {
  return message.includes('size_fit_image');
}

function withoutSizeFitImage<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const next = { ...row };
  delete next.size_fit_image_id;
  delete next.size_fit_image_url;
  return next;
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
  const select = await productDetailSelect();
  let query = supabase.from('products').select(select, { count: 'exact' }).range(from, to);

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
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,product_type.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`
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
    .select(await productDetailSelect())
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
    .select(await productDetailSelect())
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

  const supabase = getSupabase();
  const select = await productDetailSelect();
  const { data, error } = await supabase
    .from('products')
    .select(select)
    .eq('slug', key)
    .maybeSingle();

  if (error) throw catalogError('Failed to load product', error);
  if (data) return toCatalogProduct(data as Parameters<typeof toCatalogProduct>[0]);

  return getProductById(key);
}

/** Active products by id — used by guest wishlist drawer. */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select(await productDetailSelect())
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
  const row = {
    name: payload.name,
    slug: payload.slug || slugifyLabel(payload.name),
    sku: payload.sku,
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
    size_fit: payload.size_fit ?? null,
    size_fit_image_id: payload.size_fit_image_id ?? null,
    size_fit_image_url: payload.size_fit_image_url ?? null
  };
  let result = await supabase
    .from('products')
    .insert(row)
    .select(await productDetailSelect())
    .single();

  if (result.error && isMissingSizeFitImageColumn(result.error.message)) {
    result = await supabase
      .from('products')
      .insert(withoutSizeFitImage(row))
      .select(await productDetailSelect())
      .single();
  }

  if (result.error) throw catalogWriteError('Failed to create product', result.error);
  return toCatalogProduct(result.data as Parameters<typeof toCatalogProduct>[0]);
}

export async function updateProduct(
  id: string,
  input: Partial<ProductMutationPayload>
): Promise<Product> {
  const payload = productMutationSchema.partial().parse(input);
  if (payload.status === 'active') {
    const current = await getProductById(id);
    const sellable = current?.variants.filter((variant) => variant.status !== 'archived') ?? [];
    if (sellable.length === 0) {
      throw new Error('Add at least one variant before publishing this product.');
    }
  }
  const row: Record<string, unknown> = { ...payload };
  if (payload.status && payload.status !== 'archived') {
    row.deleted_at = null;
  }

  const supabase = getSupabase();
  let result = await supabase
    .from('products')
    .update(row)
    .eq('id', id)
    .select(await productDetailSelect())
    .single();

  if (result.error && isMissingSizeFitImageColumn(result.error.message)) {
    result = await supabase
      .from('products')
      .update(withoutSizeFitImage(row))
      .eq('id', id)
      .select(await productDetailSelect())
      .single();
  }

  if (result.error) throw catalogWriteError('Failed to update product', result.error);
  return toCatalogProduct(result.data as Parameters<typeof toCatalogProduct>[0]);
}

export async function archiveProduct(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('products')
    .update({ status: 'archived', deleted_at: null })
    .eq('id', id);

  if (error) throw catalogError('Failed to archive product', error);
}

export async function restoreProduct(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('products')
    .update({ status: 'draft', deleted_at: null })
    .eq('id', id);

  if (error) throw catalogError('Failed to restore product', error);
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw catalogError('Failed to delete product', error);
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
  const product = await getProductById(input.product_id);
  if (!product) throw new Error('Product not found');

  let colorOption = product.options.find((option) => option.name.toLowerCase() === 'color');
  if (!colorOption) {
    colorOption = await addProductOption({
      product_id: input.product_id,
      name: 'Color'
    });
  }

  return addProductOptionValue({
    option_id: colorOption.id,
    name: input.name,
    hex: input.hex
  });
}

export async function deleteProductColor(
  id: string,
  confirm = false
): Promise<RemoveOptionValueResult> {
  return removeProductOptionValue(id, confirm);
}

export async function upsertProductVariant(
  input: ProductVariantMutationPayload
): Promise<ProductVariant> {
  const payload = productVariantMutationSchema.parse(input);
  const product = await getProductById(payload.product_id);
  if (!product) throw new Error('Product not found');

  let optionValueIds = payload.option_value_ids ?? [];
  if (optionValueIds.length === 0) {
    if (payload.size) {
      const sizeOption = product.options.find((option) => option.name.toLowerCase() === 'size');
      const sizeValue = sizeOption?.values.find((value) => value.name === payload.size);
      if (sizeValue) optionValueIds = [...optionValueIds, sizeValue.id];
    }
    if (payload.color_id) {
      optionValueIds = [...optionValueIds, payload.color_id];
    }
  }

  if (!product.sku) throw new Error('Set a product SKU before creating variants.');

  const result = await catalogRpc<{ id: string }>('upsert_product_variant_full', {
    p_product_id: payload.product_id,
    p_sku: product.sku,
    p_option_value_ids: optionValueIds,
    p_price: payload.price,
    p_compare_at_price: payload.compare_at_price ?? null,
    p_barcode: payload.barcode ?? null,
    p_stock_quantity: payload.stock_quantity ?? null,
    p_status: payload.status ?? 'active',
    p_variant_id: payload.variant_id ?? null
  });

  const refreshed = await getProductById(payload.product_id);
  const saved = refreshed?.variants.find((variant) => variant.id === result.id);
  if (!saved) throw new Error('Variant saved but could not be reloaded.');
  return saved;
}

export async function deleteProductVariant(id: string): Promise<void> {
  await catalogRpc('archive_or_delete_variant', { p_variant_id: id });
}

export async function addProductOption(
  input: ProductOptionMutationPayload
): Promise<ProductOption> {
  const payload = productOptionMutationSchema.parse(input);
  const row = await catalogRpc<{
    id: string;
    product_id: string;
    name: string;
    position: number;
  }>('add_product_option', {
    p_product_id: payload.product_id,
    p_name: payload.name,
    p_position: payload.position ?? null
  });
  return { ...row, values: [] };
}

export async function addProductOptionValue(
  input: ProductOptionValueMutationPayload
): Promise<ProductOptionValue> {
  const payload = productOptionValueMutationSchema.parse(input);
  const row = await catalogRpc<{
    id: string;
    option_id: string;
    name: string;
    position: number;
    metadata: Record<string, unknown> | null;
  }>('add_product_option_value', {
    p_option_id: payload.option_id,
    p_name: payload.name,
    p_hex: payload.hex ?? null,
    p_position: payload.position ?? null
  });
  return {
    id: row.id,
    option_id: row.option_id,
    name: row.name,
    position: row.position,
    metadata: row.metadata,
    media_asset_ids: []
  };
}

export async function updateProductOptionValue(input: {
  value_id: string;
  name?: string;
  hex?: string | null;
  position?: number;
}): Promise<void> {
  await catalogRpc('update_product_option_value', {
    p_value_id: input.value_id,
    p_name: input.name ?? null,
    p_hex: input.hex ?? null,
    p_position: input.position ?? null
  });
}

export async function previewOptionValueUsage(valueId: string): Promise<{
  count: number;
  variants: string[];
}> {
  const result = await catalogRpc<{ count: number; variants: string[] }>(
    'preview_option_value_usage',
    { p_value_id: valueId }
  );
  return {
    count: result?.count ?? 0,
    variants: result?.variants ?? []
  };
}

export async function removeProductOptionValue(
  valueId: string,
  confirm = false
): Promise<RemoveOptionValueResult> {
  const result = await catalogRpc<RemoveOptionValueResult>('remove_product_option_value', {
    p_value_id: valueId,
    p_confirm: confirm
  });
  return {
    removed_variants: result?.removed_variants ?? 0,
    archived_variants: result?.archived_variants ?? 0
  };
}

export async function deleteProductOption(
  optionId: string,
  confirm = false
): Promise<RemoveOptionValueResult> {
  const result = await catalogRpc<RemoveOptionValueResult>('delete_product_option', {
    p_option_id: optionId,
    p_confirm: confirm
  });
  return {
    removed_variants: result?.removed_variants ?? 0,
    archived_variants: result?.archived_variants ?? 0
  };
}

export async function generateProductVariants(productId: string): Promise<GenerateVariantsResult> {
  const result = await catalogRpc<GenerateVariantsResult>('generate_product_variants', {
    p_product_id: productId
  });
  return {
    created: result?.created ?? 0,
    skipped: result?.skipped ?? 0
  };
}

export async function setVariantInventory(
  variantId: string,
  onHand: number,
  reason = 'manual_adjustment'
): Promise<void> {
  await catalogRpc('set_variant_inventory', {
    p_variant_id: variantId,
    p_on_hand: onHand,
    p_reason: reason,
    p_actor_id: null
  });
}

export async function setVariantMedia(variantId: string, mediaAssetIds: string[]): Promise<void> {
  await catalogRpc('set_variant_media', {
    p_variant_id: variantId,
    p_media_asset_ids: mediaAssetIds
  });
}

export async function setOptionValueMedia(
  optionValueId: string,
  mediaAssetIds: string[]
): Promise<void> {
  await catalogRpc('set_option_value_media', {
    p_option_value_id: optionValueId,
    p_media_asset_ids: mediaAssetIds
  });
}

export async function getInventoryAdjustments(variantId: string): Promise<InventoryAdjustment[]> {
  const supabase = getSupabase();
  const { data: item, error: itemError } = await supabase
    .from('inventory_items')
    .select('id')
    .eq('variant_id', variantId)
    .maybeSingle();
  if (itemError) throw catalogError('Failed to load inventory item', itemError);
  if (!item) return [];

  const { data, error } = await supabase
    .from('inventory_adjustments')
    .select('id, quantity_delta, previous_quantity, new_quantity, reason, created_at')
    .eq('inventory_item_id', (item as { id: string }).id)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw catalogError('Failed to load inventory history', error);

  return (data ?? []).map((row) => ({
    id: String((row as { id: string }).id),
    variant_id: variantId,
    quantity_delta: Number((row as { quantity_delta: number }).quantity_delta),
    previous_quantity: Number((row as { previous_quantity: number }).previous_quantity),
    new_quantity: Number((row as { new_quantity: number }).new_quantity),
    reason: String((row as { reason: string }).reason),
    created_at: String((row as { created_at: string }).created_at)
  }));
}

/** Admin list — includes drafts/archived when status=all */
export async function getAdminProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  return getProducts({
    ...filters,
    status: filters.status ?? 'all'
  });
}
