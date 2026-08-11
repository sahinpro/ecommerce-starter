export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('en-BD')} TK`;
}

export function formatBadge(badge: string | null): string {
  if (!badge) return '';
  return badge.replace(/_/g, ' ').toUpperCase();
}
