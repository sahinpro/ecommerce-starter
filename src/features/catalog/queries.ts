import { queryOptions } from '@tanstack/react-query';

import {
  getAdminProducts,
  getAdminCategories,
  getCategories,
  getCategoryBySlug,
  getCategoryNavChildren,
  getFeaturedProducts,
  getFilterOptions,
  getProductByIdOrSlug,
  getProductBySlug,
  getProducts,
  getRelatedProducts
} from './service';
import type { ProductFilters } from './types';

export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  adminCategories: () => [...catalogKeys.all, 'admin-categories'] as const,
  category: (slug: string) => [...catalogKeys.all, 'category', slug] as const,
  navChildren: (slug: string) => [...catalogKeys.all, 'nav-children', slug] as const,
  products: (filters: ProductFilters) => [...catalogKeys.all, 'products', filters] as const,
  adminProducts: (filters: ProductFilters) =>
    [...catalogKeys.all, 'admin-products', filters] as const,
  product: (idOrSlug: string) => [...catalogKeys.all, 'product', idOrSlug] as const,
  featured: () => [...catalogKeys.all, 'featured'] as const,
  related: (id: string, category: string) => [...catalogKeys.all, 'related', id, category] as const,
  filters: (category?: string) => [...catalogKeys.all, 'filters', category ?? 'all'] as const
};

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: catalogKeys.categories(),
    queryFn: getCategories
  });

export const adminCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: catalogKeys.adminCategories(),
    queryFn: getAdminCategories
  });

export const categoryQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: catalogKeys.category(slug),
    queryFn: () => getCategoryBySlug(slug)
  });

export const categoryNavChildrenQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: catalogKeys.navChildren(slug),
    queryFn: () => getCategoryNavChildren(slug)
  });

export const productsQueryOptions = (filters: ProductFilters) =>
  queryOptions({
    queryKey: catalogKeys.products(filters),
    queryFn: () => getProducts(filters)
  });

export const adminProductsQueryOptions = (filters: ProductFilters) =>
  queryOptions({
    queryKey: catalogKeys.adminProducts(filters),
    queryFn: () => getAdminProducts(filters)
  });

export const productBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: catalogKeys.product(slug),
    queryFn: () => getProductBySlug(slug)
  });

export const productByIdQueryOptions = (idOrSlug: string) =>
  queryOptions({
    queryKey: catalogKeys.product(idOrSlug),
    queryFn: () => getProductByIdOrSlug(idOrSlug)
  });

export const featuredProductsQueryOptions = () =>
  queryOptions({
    queryKey: catalogKeys.featured(),
    queryFn: () => getFeaturedProducts()
  });

export const relatedProductsQueryOptions = (id: string, categorySlug: string) =>
  queryOptions({
    queryKey: catalogKeys.related(id, categorySlug),
    queryFn: () => getRelatedProducts(id, categorySlug)
  });

export const filterOptionsQueryOptions = (category?: string) =>
  queryOptions({
    queryKey: catalogKeys.filters(category),
    queryFn: () => getFilterOptions(category)
  });
