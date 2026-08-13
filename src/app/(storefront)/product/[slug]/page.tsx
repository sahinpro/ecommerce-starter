import { notFound } from 'next/navigation';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import {
  productQueryOptions,
  relatedProductsQueryOptions
} from '@/features/storefront/api/queries';
import { getProductBySlug, getRelatedProducts } from '@/features/storefront/api/service';
import { ProductDetailView } from '@/features/storefront/components/product/product-detail-view';
import { getQueryClient } from '@/lib/query-client';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} | Sukoon` : 'Product | Sukoon' };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const categorySlug = product.category_slug ?? '';
  const related = categorySlug ? await getRelatedProducts(product.id, categorySlug) : [];
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(productQueryOptions(slug));
  if (categorySlug) {
    void queryClient.prefetchQuery(relatedProductsQueryOptions(product.id, categorySlug));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailView product={product} related={related} />
    </HydrationBoundary>
  );
}
