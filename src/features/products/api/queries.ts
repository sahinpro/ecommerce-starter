import {
  adminProductsQueryOptions,
  catalogKeys,
  categoriesQueryOptions,
  productByIdQueryOptions
} from '@/features/catalog/queries';
import type { Product, ProductFilters } from './types';

export type { Product };

export { catalogKeys, categoriesQueryOptions };

export const productKeys = {
  all: catalogKeys.all,
  list: (filters: ProductFilters) => catalogKeys.adminProducts(filters),
  detail: (id: string) => catalogKeys.product(id)
};

export const productsQueryOptions = (filters: ProductFilters = {}) =>
  adminProductsQueryOptions(filters);

export const productByIdOptions = (id: string) => productByIdQueryOptions(id);
