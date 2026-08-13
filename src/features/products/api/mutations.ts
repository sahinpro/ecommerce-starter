import { mutationOptions } from '@tanstack/react-query';

import { catalogKeys } from '@/features/catalog/queries';
import { getQueryClient } from '@/lib/query-client';

import {
  addProductColor,
  addProductImage,
  archiveProduct,
  createProduct,
  deleteProductColor,
  deleteProductImage,
  deleteProductVariant,
  setPrimaryProductImage,
  updateProduct,
  upsertProductVariant
} from './service';
import type { ProductMutationPayload } from './types';
import type {
  ProductColorMutationPayload,
  ProductImageMutationPayload,
  ProductVariantMutationPayload
} from '@/features/catalog/types';

function invalidateCatalog(): void {
  void getQueryClient().invalidateQueries({ queryKey: catalogKeys.all });
}

export const createProductMutation = mutationOptions({
  mutationFn: (data: ProductMutationPayload) => createProduct(data),
  onSuccess: () => invalidateCatalog()
});

export const updateProductMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: Partial<ProductMutationPayload> }) =>
    updateProduct(id, values),
  onSuccess: () => invalidateCatalog()
});

export const archiveProductMutation = mutationOptions({
  mutationFn: (id: string) => archiveProduct(id),
  onSuccess: () => invalidateCatalog()
});

export const addProductImageMutation = mutationOptions({
  mutationFn: (payload: ProductImageMutationPayload) => addProductImage(payload),
  onSuccess: () => invalidateCatalog()
});

export const deleteProductImageMutation = mutationOptions({
  mutationFn: (id: string) => deleteProductImage(id),
  onSuccess: () => invalidateCatalog()
});

export const setPrimaryProductImageMutation = mutationOptions({
  mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
    setPrimaryProductImage(productId, imageId),
  onSuccess: () => invalidateCatalog()
});

export const addProductColorMutation = mutationOptions({
  mutationFn: (payload: ProductColorMutationPayload) => addProductColor(payload),
  onSuccess: () => invalidateCatalog()
});

export const deleteProductColorMutation = mutationOptions({
  mutationFn: (id: string) => deleteProductColor(id),
  onSuccess: () => invalidateCatalog()
});

export const upsertProductVariantMutation = mutationOptions({
  mutationFn: (payload: ProductVariantMutationPayload) => upsertProductVariant(payload),
  onSuccess: () => invalidateCatalog()
});

export const deleteProductVariantMutation = mutationOptions({
  mutationFn: (id: string) => deleteProductVariant(id),
  onSuccess: () => invalidateCatalog()
});
