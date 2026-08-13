import { formatMoney } from '@/lib/format-money';

export function formatPrice(amount: number): string {
  return formatMoney(amount, 'BDT');
}

export function formatBadge(badge: string | null): string {
  if (!badge) return '';
  return badge.replace(/_/g, ' ').toUpperCase();
}
