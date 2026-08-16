import Image from 'next/image';

import { cn } from '@/lib/utils';

const icons = {
  search: {
    src: '/sukoon/icons/icon-search.svg',
    width: 16,
    height: 14
  },
  wishlist: {
    src: '/sukoon/icons/icon-wishlist.svg',
    width: 16,
    height: 14
  },
  bag: {
    src: '/assets/shopping-basket-01.svg',
    width: 18,
    height: 18
  },
  close: {
    src: '/sukoon/icons/icon-close-b.svg',
    width: 14,
    height: 14
  }
} as const;

export type StorefrontIconName = keyof typeof icons;

type StorefrontIconProps = {
  name: StorefrontIconName;
  className?: string;
  alt?: string;
  /** White assets by default; dark inverts for light backgrounds. */
  tone?: 'light' | 'dark';
};

export function StorefrontIcon({ name, className, alt = '', tone = 'light' }: StorefrontIconProps) {
  const icon = icons[name];

  return (
    <Image
      src={icon.src}
      alt={alt}
      width={icon.width}
      height={icon.height}
      className={cn('block shrink-0', tone === 'dark' && 'brightness-0', className)}
      aria-hidden={alt ? undefined : true}
      unoptimized
    />
  );
}
