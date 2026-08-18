import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide whitespace-nowrap capitalize',
  {
    variants: {
      tone: {
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
        warning:
          'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
        danger:
          'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300',
        neutral:
          'border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground'
      }
    },
    defaultVariants: {
      tone: 'neutral'
    }
  }
);

export type StatusBadgeTone = NonNullable<VariantProps<typeof statusBadgeVariants>['tone']>;

const STATUS_TONE: Record<string, StatusBadgeTone> = {
  active: 'success',
  delivered: 'success',
  paid: 'success',
  confirmed: 'success',
  ok: 'success',
  'in stock': 'success',
  draft: 'warning',
  pending: 'warning',
  processing: 'warning',
  shipped: 'warning',
  low: 'warning',
  'low stock': 'warning',
  archived: 'danger',
  cancelled: 'danger',
  canceled: 'danger',
  out: 'danger',
  'out of stock': 'danger',
  refunded: 'neutral',
  inactive: 'neutral'
};

export function statusTone(status: string): StatusBadgeTone {
  return STATUS_TONE[status.trim().toLowerCase()] ?? 'neutral';
}

export function StatusBadge({
  status,
  tone,
  className,
  children
}: {
  status?: string;
  tone?: StatusBadgeTone;
  className?: string;
  children?: ReactNode;
}) {
  const label = children ?? status ?? '';
  const resolved = tone ?? statusTone(String(status ?? label));

  return <span className={cn(statusBadgeVariants({ tone: resolved }), className)}>{label}</span>;
}
