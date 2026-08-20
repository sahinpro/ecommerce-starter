'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateCatalogAction(
  slug?: string,
  categorySlug?: string | null
): Promise<void> {
  revalidatePath('/', 'layout');
  revalidatePath('/shop');
  revalidatePath('/dashboard/product');
  if (slug) {
    revalidatePath(`/product/${slug}`);
    revalidatePath(`/dashboard/product/${slug}`);
  }
  if (categorySlug) {
    revalidatePath(`/shop/${categorySlug}`);
  }
}
