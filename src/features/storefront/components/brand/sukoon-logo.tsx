import Link from 'next/link';

import { cn } from '@/lib/utils';

type SukoonLogoProps = {
  className?: string;
  href?: string;
};

export function SukoonLogo({ className, href = '/' }: SukoonLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        'font-serif text-xl font-normal tracking-[0.35em] uppercase',
        className
      )}
    >
      Sukoon
    </Link>
  );
}
