import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

type SukoonLogoProps = {
  className?: string;
  href?: string;
  variant?: 'header' | 'footer';
  /** Header only — white for hero overlay, black for solid / menu panels. */
  tone?: 'white' | 'black';
  onClick?: () => void;
};

const logoSrc = {
  header: {
    white: '/sukoon/logo/sukoon-logo-white.svg',
    black: '/sukoon/logo/sukoon-logo-black.svg',
    width: 144,
    height: 20
  },
  footer: {
    src: '/sukoon/logo/sukoon-wordmark.svg',
    width: 455,
    height: 62
  }
} as const;

export function SukoonLogo({
  className,
  href = '/',
  variant = 'header',
  tone = 'white',
  onClick
}: SukoonLogoProps) {
  const logo =
    variant === 'header'
      ? {
          src: logoSrc.header[tone],
          width: logoSrc.header.width,
          height: logoSrc.header.height
        }
      : logoSrc.footer;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn('inline-flex shrink-0 items-center', className)}
      aria-label='Sukoon home'
    >
      <Image
        src={logo.src}
        alt='Sukoon'
        width={logo.width}
        height={logo.height}
        className={cn(
          'block max-w-full',
          variant === 'header' && 'h-[19.54px] w-[143.785px]',
          variant === 'footer' && 'h-15.5 w-113.75 max-w-full'
        )}
        unoptimized
        priority={variant === 'header'}
      />
    </Link>
  );
}
