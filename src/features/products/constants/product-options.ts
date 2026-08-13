import { formatMoney } from '@/lib/format-money';

export { PRODUCT_BADGE_OPTIONS, PRODUCT_STATUS_OPTIONS } from '@/features/catalog/constants';

export function slugifyProductName(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function sumVariantStock(
  variants: { stock_quantity?: number | null }[] | undefined
): number {
  if (!variants?.length) return 0;
  return variants.reduce((sum, variant) => sum + (variant.stock_quantity ?? 0), 0);
}

export function formatProductPrice(value: number): string {
  return formatMoney(value, 'BDT');
}

export function formatProductDate(value: string): string {
  return new Intl.DateTimeFormat('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
}
