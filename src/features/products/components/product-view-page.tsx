'use client';

import { notFound } from 'next/navigation';
import { useSuspenseQuery } from '@tanstack/react-query';

import { productByIdOptions } from '../api/queries';
import ProductForm from './product-form';

type ProductViewPageProps = {
  productId: string;
};

export default function ProductViewPage({ productId }: ProductViewPageProps) {
  if (productId === 'new') {
    return <NewProductView />;
  }

  return <EditProductView productId={productId} />;
}

function NewProductView() {
  return <ProductForm initialData={null} />;
}

function EditProductView({ productId }: { productId: string }) {
  const { data: product } = useSuspenseQuery(productByIdOptions(productId));

  if (!product) {
    notFound();
  }

  return <ProductForm initialData={product} />;
}
