import Link from 'next/link';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

type ShopBreadcrumbItem = {
  label: string;
  href?: string;
};

type ShopBreadcrumbProps = {
  items: ShopBreadcrumbItem[];
  className?: string;
};

export function ShopBreadcrumb({ items, className }: ShopBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label='Breadcrumb' className={cn('mb-3', className)}>
      <ol className='flex flex-wrap items-center gap-1 text-[13px] tracking-[0.26px]'>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className='flex items-center gap-1'>
              {index > 0 ? (
                <Icons.chevronRight className='text-muted-foreground size-3.5' aria-hidden />
              ) : null}
              {item.href && !last ? (
                <Link href={item.href} className='text-muted-foreground hover:text-foreground'>
                  {item.label}
                </Link>
              ) : (
                <span
                  className={last ? 'text-foreground' : 'text-muted-foreground'}
                  aria-current={last ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
