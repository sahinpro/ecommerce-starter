import Link from 'next/link';

import { cn } from '@/lib/utils';

type SukoonLogoProps = {
  className?: string;
  href?: string;
  variant?: 'header' | 'footer';
};

const logoSrc = {
  header: {
    src: '/sukoon/logo/sukoon-logo-white.svg',
    width: 143.785,
    height: 19.54
  },
  footer: {
    src: '/sukoon/logo/sukoon-wordmark.svg',
    width: 455,
    height: 62
  }
} as const;

export function SukoonLogo({ className, href = '/', variant = 'header' }: SukoonLogoProps) {
  const logo = logoSrc[variant];

  return (
    <Link
      href={href}
      className={cn('inline-flex shrink-0 items-center', className)}
      aria-label='Sukoon home'
    >
      <img
        src={logo.src}
        alt='Sukoon'
        width={logo.width}
        height={logo.height}
        className={cn(
          'block max-w-full',
          variant === 'header' && 'h-[19.54px] w-[143.785px]',
          variant === 'footer' && 'h-[62px] w-[455px] max-w-full'
        )}
      />
    </Link>
  );
}
