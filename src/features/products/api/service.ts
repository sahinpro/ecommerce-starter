/**
 * Products dashboard service — thin wrappers around the canonical catalog layer.
 * Swap/backends live in `@/features/catalog/service`; do not call mock-api here.
 */

export {
  addProductColor,
  addProductImage,
  archiveProduct,
  createProduct,
  deleteProductColor,
  deleteProductImage,
  deleteProductVariant,
  getAdminProducts as getProducts,
  getCategories,
  getProductById,
  getProductByIdOrSlug,
  setPrimaryProductImage,
  updateProduct,
  upsertProductVariant
} from '@/features/catalog/service';
