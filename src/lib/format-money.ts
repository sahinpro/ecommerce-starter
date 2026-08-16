import { DEFAULT_CURRENCY } from '@/features/orders/constants';

/** Bangladesh-first money formatting (BDT prefix, not ৳). */
export function formatMoney(amount: number, currency: string = DEFAULT_CURRENCY): string {
  const value = Number.isFinite(amount) ? amount : 0;
  if (currency === 'BDT' || currency === 'TK') {
    return `BDT ${value.toLocaleString('en-BD', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    })}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);
}
