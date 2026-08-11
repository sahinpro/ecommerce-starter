import { matchSorter } from 'match-sorter';

import {
  benefits,
  categories,
  collectionTiles,
  filterOptions,
  heroContent,
  products,
  stories
} from '../constants/mock-data';
import type {
  Benefit,
  Category,
  CollectionTile,
  FilterOptions,
  Product,
  ProductFilters,
  ProductsResponse,
  Story
} from './types';

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function filterProducts(list: Product[], filters: ProductFilters): Product[] {
  let result = [...list];

  if (filters.category && filters.category !== 'all') {
    if (filters.category === 'new-arrivals') {
      result = result.filter((p) => p.badge === 'new' || p.featured);
    } else {
      result = result.filter((p) => p.category_slug === filters.category);
    }
  }

  if (filters.product_types?.length) {
    result = result.filter((p) => filters.product_types!.includes(p.product_type));
  }

  if (filters.sizes?.length) {
    result = result.filter((p) =>
      p.sizes.some((s) => filters.sizes!.includes(s))
    );
  }

  if (filters.colors?.length) {
    result = result.filter((p) =>
      p.colors.some((c) => filters.colors!.includes(c.name))
    );
  }

  if (filters.search) {
    result = matchSorter(result, filters.search, {
      keys: ['name', 'description', 'product_type', 'category_slug']
    });
  }

  if (filters.sort === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (filters.sort === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  } else {
    result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  return result;
}

export async function getCategories(): Promise<Category[]> {
  await delay(80);
  return categories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  await delay(60);
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  await delay(120);
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 12;
  const filtered = filterProducts(products, filters);
  const start = (page - 1) * limit;

  return {
    products: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await delay(80);
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  await delay(80);
  return products.filter((p) => p.featured).slice(0, limit);
}

export async function getRelatedProducts(
  productId: string,
  categorySlug: string,
  limit = 4
): Promise<Product[]> {
  await delay(80);
  return products
    .filter((p) => p.id !== productId && p.category_slug === categorySlug)
    .slice(0, limit);
}

export async function getStories(): Promise<Story[]> {
  await delay(60);
  return stories;
}

export async function getCollectionTiles(): Promise<CollectionTile[]> {
  await delay(60);
  return collectionTiles;
}

export async function getBenefits(): Promise<Benefit[]> {
  await delay(60);
  return benefits;
}

export async function getFilterOptions(): Promise<FilterOptions> {
  await delay(40);
  return filterOptions;
}

export async function getHeroContent() {
  await delay(40);
  return heroContent;
}

export async function searchProducts(query: string): Promise<Product[]> {
  await delay(100);
  return filterProducts(products, { search: query });
}
