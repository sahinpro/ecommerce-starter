'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateCatalogAction(slug?: string): Promise<void> {
  revalidatePath('/', 'layout');
  revalidatePath('/shop');
  revalidatePath('/dashboard/product');
  if (slug) {
    revalidatePath(`/product/${slug}`);
    revalidatePath(`/shop/${slug}`);
    revalidatePath(`/dashboard/product/${slug}`);
  }
}
