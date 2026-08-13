import type { ProductBadge } from '../../api/types';

import { cn } from '@/lib/utils';

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
        'absolute top-[10px] left-3.5 text-[14px] leading-[18px] tracking-[0.42px] uppercase',
        className
      )}
    >
      {label}
    </span>
  );
}
