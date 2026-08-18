import { mutationOptions } from '@tanstack/react-query';

import { revalidateCatalogAction } from '@/features/catalog/actions';
import { catalogKeys } from '@/features/catalog/queries';
import { getQueryClient } from '@/lib/query-client';

import {
  addProductColor,
  addProductImage,
  addProductOption,
  addProductOptionValue,
  archiveProduct,
  createProduct,
  deleteProductImage,
  deleteProductOption,
  deleteProductVariant,
  generateProductVariants,
  removeProductOptionValue,
  setPrimaryProductImage,
  setVariantInventory,
  setVariantMedia,
  updateProduct,
  updateProductOptionValue,
  upsertProductVariant
} from './service';
import type { ProductMutationPayload } from './types';
import type {
  ProductColorMutationPayload,
  ProductImageMutationPayload,
  ProductOptionMutationPayload,
  ProductOptionValueMutationPayload,
  ProductVariantMutationPayload
} from '@/features/catalog/types';

function invalidateCatalog(slug?: string): void {
  void getQueryClient().invalidateQueries({ queryKey: catalogKeys.all });
  void revalidateCatalogAction(slug);
}

export const createProductMutation = mutationOptions({
  mutationFn: (data: ProductMutationPayload) => createProduct(data),
  onSuccess: (product) => invalidateCatalog(product.slug)
});

export const updateProductMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: Partial<ProductMutationPayload> }) =>
    updateProduct(id, values),
  onSuccess: (product) => invalidateCatalog(product.slug)
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

export const addProductOptionMutation = mutationOptions({
  mutationFn: (payload: ProductOptionMutationPayload) => addProductOption(payload),
  onSuccess: () => invalidateCatalog()
});

export const addProductOptionValueMutation = mutationOptions({
  mutationFn: (payload: ProductOptionValueMutationPayload) => addProductOptionValue(payload),
  onSuccess: () => invalidateCatalog()
});

export const updateProductOptionValueMutation = mutationOptions({
  mutationFn: (payload: {
    value_id: string;
    name?: string;
    hex?: string | null;
    position?: number;
  }) => updateProductOptionValue(payload),
  onSuccess: () => invalidateCatalog()
});

export const removeProductOptionValueMutation = mutationOptions({
  mutationFn: ({ id, confirm }: { id: string; confirm?: boolean }) =>
    removeProductOptionValue(id, confirm),
  onSuccess: () => invalidateCatalog()
});

export const deleteProductOptionMutation = mutationOptions({
  mutationFn: ({ id, confirm }: { id: string; confirm?: boolean }) =>
    deleteProductOption(id, confirm),
  onSuccess: () => invalidateCatalog()
});

export const generateProductVariantsMutation = mutationOptions({
  mutationFn: (productId: string) => generateProductVariants(productId),
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

export const setVariantInventoryMutation = mutationOptions({
  mutationFn: ({ variantId, onHand }: { variantId: string; onHand: number }) =>
    setVariantInventory(variantId, onHand),
  onSuccess: () => invalidateCatalog()
});

export const setVariantMediaMutation = mutationOptions({
  mutationFn: ({ variantId, mediaAssetIds }: { variantId: string; mediaAssetIds: string[] }) =>
    setVariantMedia(variantId, mediaAssetIds),
  onSuccess: () => invalidateCatalog()
});
