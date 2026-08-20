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

export type CatalogRevalidate = {
  productSlug: string;
  categorySlug?: string | null;
};

export function catalogRevalidate(product: {
  slug: string;
  category_slug?: string | null;
}): CatalogRevalidate {
  return { productSlug: product.slug, categorySlug: product.category_slug };
}

function invalidateCatalog(slug?: string, categorySlug?: string | null): void {
  void getQueryClient().invalidateQueries({ queryKey: catalogKeys.all });
  void revalidateCatalogAction(slug, categorySlug);
}

function invalidateFromVariables(
  _data: unknown,
  _error: unknown,
  variables: CatalogRevalidate
): void {
  invalidateCatalog(variables.productSlug, variables.categorySlug);
}

export const createProductMutation = mutationOptions({
  mutationFn: (data: ProductMutationPayload) => createProduct(data),
  onSettled: (product) => invalidateCatalog(product?.slug, product?.category_slug)
});

export const updateProductMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: Partial<ProductMutationPayload> }) =>
    updateProduct(id, values),
  onSettled: (product) => invalidateCatalog(product?.slug, product?.category_slug)
});

export const archiveProductMutation = mutationOptions({
  mutationFn: ({ id }: { id: string } & CatalogRevalidate) => archiveProduct(id),
  onSettled: invalidateFromVariables
});

export const restoreProductMutation = mutationOptions({
  mutationFn: ({ id }: { id: string } & CatalogRevalidate) => restoreProduct(id),
  onSettled: invalidateFromVariables
});

export const deleteProductMutation = mutationOptions({
  mutationFn: ({ id }: { id: string } & CatalogRevalidate) => deleteProduct(id),
  onSettled: invalidateFromVariables
});

export const addProductImageMutation = mutationOptions({
  mutationFn: ({
    productSlug: _productSlug,
    categorySlug: _categorySlug,
    ...payload
  }: ProductImageMutationPayload & CatalogRevalidate) => addProductImage(payload),
  onSettled: invalidateFromVariables
});

export const deleteProductImageMutation = mutationOptions({
  mutationFn: ({ id }: { id: string } & CatalogRevalidate) => deleteProductImage(id),
  onSettled: invalidateFromVariables
});

export const setPrimaryProductImageMutation = mutationOptions({
  mutationFn: ({
    productId,
    imageId
  }: {
    productId: string;
    imageId: string;
  } & CatalogRevalidate) => setPrimaryProductImage(productId, imageId),
  onSettled: invalidateFromVariables
});

export const addProductColorMutation = mutationOptions({
  mutationFn: ({
    productSlug: _productSlug,
    categorySlug: _categorySlug,
    ...payload
  }: ProductColorMutationPayload & CatalogRevalidate) => addProductColor(payload),
  onSettled: invalidateFromVariables
});

export const addProductOptionMutation = mutationOptions({
  mutationFn: ({
    productSlug: _productSlug,
    categorySlug: _categorySlug,
    ...payload
  }: ProductOptionMutationPayload & CatalogRevalidate) => addProductOption(payload),
  onSettled: invalidateFromVariables
});

export const addProductOptionValueMutation = mutationOptions({
  mutationFn: ({
    productSlug: _productSlug,
    categorySlug: _categorySlug,
    ...payload
  }: ProductOptionValueMutationPayload & CatalogRevalidate) => addProductOptionValue(payload),
  onSettled: invalidateFromVariables
});

export const updateProductOptionValueMutation = mutationOptions({
  mutationFn: ({
    productSlug: _productSlug,
    categorySlug: _categorySlug,
    ...payload
  }: {
    value_id: string;
    name?: string;
    hex?: string | null;
    position?: number;
  } & CatalogRevalidate) => updateProductOptionValue(payload),
  onSettled: invalidateFromVariables
});

export const removeProductOptionValueMutation = mutationOptions({
  mutationFn: ({
    id,
    confirm
  }: {
    id: string;
    confirm?: boolean;
  } & CatalogRevalidate) => removeProductOptionValue(id, confirm),
  onSettled: invalidateFromVariables
});

export const deleteProductOptionMutation = mutationOptions({
  mutationFn: ({
    id,
    confirm
  }: {
    id: string;
    confirm?: boolean;
  } & CatalogRevalidate) => deleteProductOption(id, confirm),
  onSettled: invalidateFromVariables
});

export const generateProductVariantsMutation = mutationOptions({
  mutationFn: ({ productId }: { productId: string } & CatalogRevalidate) =>
    generateProductVariants(productId),
  onSettled: invalidateFromVariables
});

export const upsertProductVariantMutation = mutationOptions({
  mutationFn: ({
    productSlug: _productSlug,
    categorySlug: _categorySlug,
    ...payload
  }: ProductVariantMutationPayload & CatalogRevalidate) => upsertProductVariant(payload),
  onSettled: invalidateFromVariables
});

export const deleteProductVariantMutation = mutationOptions({
  mutationFn: ({ id }: { id: string } & CatalogRevalidate) => deleteProductVariant(id),
  onSettled: invalidateFromVariables
});

export const setVariantInventoryMutation = mutationOptions({
  mutationFn: ({
    variantId,
    onHand
  }: {
    variantId: string;
    onHand: number;
  } & CatalogRevalidate) => setVariantInventory(variantId, onHand),
  onSettled: invalidateFromVariables
});

export const setOptionValueMediaMutation = mutationOptions({
  mutationFn: ({
    optionValueId,
    mediaAssetIds
  }: {
    optionValueId: string;
    mediaAssetIds: string[];
  } & CatalogRevalidate) => setOptionValueMedia(optionValueId, mediaAssetIds),
  onSettled: invalidateFromVariables
});
