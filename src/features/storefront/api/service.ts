import {
  getActiveProductSlugs as catalogGetActiveProductSlugs,
  getCategories as catalogGetCategories,
  getCategoryBySlug as catalogGetCategoryBySlug,
  getFeaturedProducts as catalogGetFeaturedProducts,
  getFilterOptions as catalogGetFilterOptions,
  getProductBySlug as catalogGetProductBySlug,
  getProducts as catalogGetProducts,
  getProductsByIds as catalogGetProductsByIds,
  getRelatedProducts as catalogGetRelatedProducts
} from '@/features/catalog/service';
import type { ProductFilters } from '@/features/catalog/types';

import { benefits, collectionTiles, heroContent, stories } from '../constants/mock-data';
import type {
  Benefit,
  Category,
  CollectionTile,
  FilterOptions,
  Product,
  ProductsResponse,
  Story
} from './types';

/** Catalog reads — Supabase via shared catalog service (no mock products). */

export async function getCategories(): Promise<Category[]> {
  return catalogGetCategories();
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return catalogGetCategoryBySlug(slug);
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  return catalogGetProducts({ ...filters, status: 'active' });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await catalogGetProductBySlug(slug);
  if (!product || product.status !== 'active' || product.deleted_at) return null;
  return product;
}

export async function getActiveProductSlugs(): Promise<string[]> {
  return catalogGetActiveProductSlugs();
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  return catalogGetProductsByIds(ids);
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  return catalogGetFeaturedProducts(limit);
}

export async function getRelatedProducts(
  productId: string,
  categorySlug: string,
  limit = 4
): Promise<Product[]> {
  return catalogGetRelatedProducts(productId, categorySlug, limit);
}

export async function getFilterOptions(category?: string): Promise<FilterOptions> {
  return catalogGetFilterOptions(category);
}

/** CMS-ish content still static until a later content phase. */
export async function getStories(): Promise<Story[]> {
  return stories;
}

export async function getCollectionTiles(): Promise<CollectionTile[]> {
  return collectionTiles;
}

export async function getBenefits(): Promise<Benefit[]> {
  return benefits;
}

export async function getHeroContent() {
  return heroContent;
}
