import { cn } from '@/lib/utils';

const icons = {
  search: {
    src: '/sukoon/icons/icon-search.svg',
    width: 16,
    height: 14
  },
  account: {
    src: '/sukoon/icons/icon-account.svg',
    width: 16,
    height: 18
  },
  wishlist: {
    src: '/sukoon/icons/icon-wishlist.svg',
    width: 16,
    height: 14
  },
  bag: {
    src: '/sukoon/icons/icon-bag.svg',
    width: 16,
    height: 16
  },
  currencyChevron: {
    src: '/sukoon/icons/currency-chevron.svg',
    width: 12,
    height: 13
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
};

export function StorefrontIcon({ name, className, alt = '' }: StorefrontIconProps) {
  const icon = icons[name];

  return (
    <img
      src={icon.src}
      alt={alt}
      width={icon.width}
      height={icon.height}
      className={cn('block shrink-0', className)}
      aria-hidden={alt ? undefined : true}
    />
  );
}
