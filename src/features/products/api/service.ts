/**
 * Products dashboard service — thin wrappers around the canonical catalog layer.
 * Swap/backends live in `@/features/catalog/service`; do not call mock-api here.
 */

export {
  addProductColor,
  addProductImage,
  addProductOption,
  addProductOptionValue,
  archiveProduct,
  createProduct,
  deleteProductColor,
  deleteProductImage,
  deleteProductOption,
  deleteProductVariant,
  generateProductVariants,
  getAdminProducts as getProducts,
  getCategories,
  getInventoryAdjustments,
  getProductById,
  getProductByIdOrSlug,
  previewOptionValueUsage,
  removeProductOptionValue,
  setPrimaryProductImage,
  setVariantInventory,
  setVariantMedia,
  updateProduct,
  updateProductOptionValue,
  upsertProductVariant
} from '@/features/catalog/service';
