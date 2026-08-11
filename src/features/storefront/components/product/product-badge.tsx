import type { ProductBadge } from '../../api/types';

import { cn } from '@/lib/utils';

const badgeStyles: Record<NonNullable<ProductBadge>, string> = {
  new: 'bg-white text-foreground',
  best_seller: 'bg-white text-foreground',
  back_in_stock: 'bg-white text-foreground',
  sale: 'bg-white text-foreground'
};

type ProductBadgeLabelProps = {
  badge: ProductBadge;
  className?: string;
};

export function ProductBadgeLabel({ badge, className }: ProductBadgeLabelProps) {
  if (!badge) return null;

  const label =
    badge === 'best_seller'
      ? 'Best Seller'
      : badge === 'back_in_stock'
        ? 'Back In Stock'
        : badge.charAt(0).toUpperCase() + badge.slice(1);

  return (
    <span
      className={cn(
        'absolute top-3 left-3.5 px-2 py-0.5 text-[11px] tracking-wide uppercase',
        badgeStyles[badge],
        className
      )}
    >
      {label}
    </span>
  );
}
