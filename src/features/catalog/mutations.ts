import { mutationOptions } from '@tanstack/react-query';

import {
  addProductColor,
  addProductImage,
  archiveProduct,
  createCategory,
  createProduct,
  deleteCategory,
  deleteProductColor,
  deleteProductImage,
  deleteProductVariant,
  updateCategory,
  updateProduct,
  upsertProductVariant
} from './service';
import type {
  CategoryMutationPayload,
  ProductColorMutationPayload,
  ProductImageMutationPayload,
  ProductMutationPayload,
  ProductVariantMutationPayload
} from './types';
import { catalogKeys } from './queries';

export const createProductMutation = () =>
  mutationOptions({
    mutationFn: (payload: ProductMutationPayload) => createProduct(payload),
    meta: { invalidates: [catalogKeys.all] }
  });

export const updateProductMutation = (id: string) =>
  mutationOptions({
    mutationFn: (payload: Partial<ProductMutationPayload>) => updateProduct(id, payload),
    meta: { invalidates: [catalogKeys.all] }
  });

export const archiveProductMutation = () =>
  mutationOptions({
    mutationFn: (id: string) => archiveProduct(id),
    meta: { invalidates: [catalogKeys.all] }
  });

export const createCategoryMutation = () =>
  mutationOptions({
    mutationFn: (payload: CategoryMutationPayload) => createCategory(payload),
    meta: { invalidates: [catalogKeys.all] }
  });

export const updateCategoryMutation = (id: string) =>
  mutationOptions({
    mutationFn: (payload: Partial<CategoryMutationPayload>) => updateCategory(id, payload),
    meta: { invalidates: [catalogKeys.all] }
  });

export const deleteCategoryMutation = () =>
  mutationOptions({
    mutationFn: (id: string) => deleteCategory(id),
    meta: { invalidates: [catalogKeys.all] }
  });

export const addProductImageMutation = () =>
  mutationOptions({
    mutationFn: (payload: ProductImageMutationPayload) => addProductImage(payload)
  });

export const deleteProductImageMutation = () =>
  mutationOptions({
    mutationFn: (id: string) => deleteProductImage(id)
  });

export const addProductColorMutation = () =>
  mutationOptions({
    mutationFn: (payload: ProductColorMutationPayload) => addProductColor(payload)
  });

export const deleteProductColorMutation = () =>
  mutationOptions({
    mutationFn: (id: string) => deleteProductColor(id)
  });

export const upsertProductVariantMutation = () =>
  mutationOptions({
    mutationFn: (payload: ProductVariantMutationPayload) => upsertProductVariant(payload)
  });

export const deleteProductVariantMutation = () =>
  mutationOptions({
    mutationFn: (id: string) => deleteProductVariant(id)
  });
