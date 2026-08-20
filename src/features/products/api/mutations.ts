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
  deleteProduct,
  deleteProductImage,
  deleteProductOption,
  deleteProductVariant,
  generateProductVariants,
  removeProductOptionValue,
  restoreProduct,
  setPrimaryProductImage,
  setVariantInventory,
  setOptionValueMedia,
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
  onSettled: (product) => invalidateCatalog(product?.slug)
});

export const updateProductMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: Partial<ProductMutationPayload> }) =>
    updateProduct(id, values),
  onSettled: (product) => invalidateCatalog(product?.slug)
});

export const archiveProductMutation = mutationOptions({
  mutationFn: (id: string) => archiveProduct(id),
  onSettled: () => invalidateCatalog()
});

export const restoreProductMutation = mutationOptions({
  mutationFn: (id: string) => restoreProduct(id),
  onSettled: () => invalidateCatalog()
});

export const deleteProductMutation = mutationOptions({
  mutationFn: (id: string) => deleteProduct(id),
  onSettled: () => invalidateCatalog()
});

export const addProductImageMutation = mutationOptions({
  mutationFn: (payload: ProductImageMutationPayload) => addProductImage(payload),
  onSettled: () => invalidateCatalog()
});

export const deleteProductImageMutation = mutationOptions({
  mutationFn: (id: string) => deleteProductImage(id),
  onSettled: () => invalidateCatalog()
});

export const setPrimaryProductImageMutation = mutationOptions({
  mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
    setPrimaryProductImage(productId, imageId),
  onSettled: () => invalidateCatalog()
});

export const addProductColorMutation = mutationOptions({
  mutationFn: (payload: ProductColorMutationPayload) => addProductColor(payload),
  onSettled: () => invalidateCatalog()
});

export const addProductOptionMutation = mutationOptions({
  mutationFn: (payload: ProductOptionMutationPayload) => addProductOption(payload),
  onSettled: () => invalidateCatalog()
});

export const addProductOptionValueMutation = mutationOptions({
  mutationFn: (payload: ProductOptionValueMutationPayload) => addProductOptionValue(payload),
  onSettled: () => invalidateCatalog()
});

export const updateProductOptionValueMutation = mutationOptions({
  mutationFn: (payload: {
    value_id: string;
    name?: string;
    hex?: string | null;
    position?: number;
  }) => updateProductOptionValue(payload),
  onSettled: () => invalidateCatalog()
});

export const removeProductOptionValueMutation = mutationOptions({
  mutationFn: ({ id, confirm }: { id: string; confirm?: boolean }) =>
    removeProductOptionValue(id, confirm),
  onSettled: () => invalidateCatalog()
});

export const deleteProductOptionMutation = mutationOptions({
  mutationFn: ({ id, confirm }: { id: string; confirm?: boolean }) =>
    deleteProductOption(id, confirm),
  onSettled: () => invalidateCatalog()
});

export const generateProductVariantsMutation = mutationOptions({
  mutationFn: (productId: string) => generateProductVariants(productId),
  onSettled: () => invalidateCatalog()
});

export const upsertProductVariantMutation = mutationOptions({
  mutationFn: (payload: ProductVariantMutationPayload) => upsertProductVariant(payload),
  onSettled: () => invalidateCatalog()
});

export const deleteProductVariantMutation = mutationOptions({
  mutationFn: (id: string) => deleteProductVariant(id),
  onSettled: () => invalidateCatalog()
});

export const setVariantInventoryMutation = mutationOptions({
  mutationFn: ({ variantId, onHand }: { variantId: string; onHand: number }) =>
    setVariantInventory(variantId, onHand),
  onSettled: () => invalidateCatalog()
});

export const setOptionValueMediaMutation = mutationOptions({
  mutationFn: ({
    optionValueId,
    mediaAssetIds
  }: {
    optionValueId: string;
    mediaAssetIds: string[];
  }) => setOptionValueMedia(optionValueId, mediaAssetIds),
  onSettled: () => invalidateCatalog()
});
