import { queryOptions } from '@tanstack/react-query';

import {
  getBenefits,
  getCategories,
  getCategoryBySlug,
  getCollectionTiles,
  getFeaturedProducts,
  getFilterOptions,
  getHeroContent,
  getProductBySlug,
  getProducts,
  getProductsByIds,
  getRelatedProducts,
  getStories
} from './service';
import type { ProductFilters } from './types';

export const storefrontKeys = {
  all: ['storefront'] as const,
  categories: () => [...storefrontKeys.all, 'categories'] as const,
  category: (slug: string) => [...storefrontKeys.all, 'category', slug] as const,
  products: (filters: ProductFilters) => [...storefrontKeys.all, 'products', filters] as const,
  productsByIds: (ids: string[]) =>
    [...storefrontKeys.all, 'products-by-ids', [...ids].sort()] as const,
  product: (slug: string) => [...storefrontKeys.all, 'product', slug] as const,
  featured: () => [...storefrontKeys.all, 'featured'] as const,
  related: (id: string, category: string) =>
    [...storefrontKeys.all, 'related', id, category] as const,
  stories: () => [...storefrontKeys.all, 'stories'] as const,
  tiles: () => [...storefrontKeys.all, 'tiles'] as const,
  benefits: () => [...storefrontKeys.all, 'benefits'] as const,
  filters: (category?: string) => [...storefrontKeys.all, 'filters', category ?? 'all'] as const,
  hero: () => [...storefrontKeys.all, 'hero'] as const
};

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: storefrontKeys.categories(),
    queryFn: getCategories
  });

export const categoryQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: storefrontKeys.category(slug),
    queryFn: () => getCategoryBySlug(slug)
  });

export const productsQueryOptions = (filters: ProductFilters) =>
  queryOptions({
    queryKey: storefrontKeys.products(filters),
    queryFn: () => getProducts(filters)
  });

export const productQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: storefrontKeys.product(slug),
    queryFn: () => getProductBySlug(slug)
  });

export const productsByIdsQueryOptions = (ids: string[]) =>
  queryOptions({
    queryKey: storefrontKeys.productsByIds(ids),
    queryFn: () => getProductsByIds(ids),
    enabled: ids.length > 0
  });

export const featuredProductsQueryOptions = () =>
  queryOptions({
    queryKey: storefrontKeys.featured(),
    queryFn: () => getFeaturedProducts()
  });

export const relatedProductsQueryOptions = (id: string, categorySlug: string) =>
  queryOptions({
    queryKey: storefrontKeys.related(id, categorySlug),
    queryFn: () => getRelatedProducts(id, categorySlug)
  });

export const storiesQueryOptions = () =>
  queryOptions({
    queryKey: storefrontKeys.stories(),
    queryFn: getStories
  });

export const collectionTilesQueryOptions = () =>
  queryOptions({
    queryKey: storefrontKeys.tiles(),
    queryFn: getCollectionTiles
  });

export const benefitsQueryOptions = () =>
  queryOptions({
    queryKey: storefrontKeys.benefits(),
    queryFn: getBenefits
  });

export const filterOptionsQueryOptions = (category?: string) =>
  queryOptions({
    queryKey: storefrontKeys.filters(category),
    queryFn: () => getFilterOptions(category)
  });

export const heroQueryOptions = () =>
  queryOptions({
    queryKey: storefrontKeys.hero(),
    queryFn: getHeroContent
  });
