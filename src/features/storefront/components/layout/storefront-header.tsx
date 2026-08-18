'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { Icons } from '@/components/icons';
import type { NavPrimaryItem } from '@/features/catalog/types';
import { resolvedNavQueryOptions } from '@/features/navigation/api/queries';
import { cn } from '@/lib/utils';

import { useCartStore } from '../../utils/cart-store';
import { useWishlistStore } from '../../utils/wishlist-store';
import { StorefrontIcon } from '../brand/storefront-icon';
import { SukoonLogo } from '../brand/sukoon-logo';
import { SearchDrawer } from '../search/search-drawer';
import { WishlistDrawer } from '../wishlist/wishlist-drawer';
import { AnnouncementBar } from './announcement-bar';
import { StorefrontMegaMenu } from './storefront-mega-menu';

const SCROLL_DELTA = 6;
const SHOW_AFTER_TOP = 8;
const STICKY_REVEAL_Y = 48;
const SLIDE_MS = 400;

type HeaderMenuButtonProps = {
  open: boolean;
  onToggle: () => void;
  inverted: boolean;
};

function HeaderMenuButton({ open, onToggle, inverted }: HeaderMenuButtonProps) {
  return (
    <button
      type='button'
      onClick={onToggle}
      className={cn(
        'flex w-fit cursor-pointer items-center gap-2 text-[14px] tracking-[0.04em] hover:opacity-70 md:text-[13px] md:tracking-[0.26px]',
        inverted
          ? 'text-sukoon-black underline decoration-1 underline-offset-1.25'
          : 'text-white no-underline'
      )}
      aria-label='Open menu'
      aria-expanded={open}
    >
      <Icons.menu className='hidden size-4 md:block' />
      <span className='md:hidden'>Menu</span>
      <span className='hidden md:inline'>Menu</span>
    </button>
  );
}

type HeaderToolsProps = {
  searchOpen: boolean;
  wishlistCount: number;
  cartCount: number;
  inverted: boolean;
  onSearch: () => void;
  onWishlist: () => void;
};

function HeaderTools({
  searchOpen,
  wishlistCount,
  cartCount,
  inverted,
  onSearch,
  onWishlist
}: HeaderToolsProps) {
  const tone = inverted ? 'dark' : 'light';

  return (
    <div className='flex items-center gap-3.5 md:h-4.5 md:gap-4'>
      <button
        type='button'
        aria-label='Search'
        aria-expanded={searchOpen}
        className='relative cursor-pointer'
        onClick={onSearch}
      >
        <StorefrontIcon name='search' tone={tone} className='h-[14.11px] w-4' />
      </button>
      <button
        type='button'
        onClick={onWishlist}
        className='relative hidden cursor-pointer md:inline-flex'
        aria-label='Wishlist'
      >
        <StorefrontIcon name='wishlist' tone={tone} className='h-[14.22px] w-4' />
        {wishlistCount > 0 ? (
          <span
            className={cn(
              'absolute -top-2 -right-2 flex size-4 items-center justify-center text-[10px]',
              inverted ? 'bg-sukoon-black text-white' : 'bg-white text-black'
            )}
          >
            {wishlistCount}
          </span>
        ) : null}
      </button>
      <Link href='/cart' className='relative cursor-pointer' aria-label='Shopping bag'>
        <StorefrontIcon name='bag' tone={tone} className='size-4.5' />
        {cartCount > 0 ? (
          <span
            className={cn(
              'absolute -top-2 -right-2 flex size-4 items-center justify-center text-[10px]',
              inverted ? 'bg-sukoon-black text-white' : 'bg-white text-black'
            )}
          >
            {cartCount}
          </span>
        ) : null}
      </Link>
    </div>
  );
}

type HeaderChromeProps = {
  inverted: boolean;
  stackedNav: boolean;
  menuOpen: boolean;
  announcementVisible: boolean;
  onAnnouncementDismiss: () => void;
  toolsProps: Omit<HeaderToolsProps, 'inverted'>;
  onMenuToggle: () => void;
  onNavItemHover: (item: NavPrimaryItem) => void;
  primaryNav: NavPrimaryItem[];
};

function HeaderChrome({
  inverted,
  stackedNav,
  menuOpen,
  announcementVisible,
  onAnnouncementDismiss,
  toolsProps,
  onMenuToggle,
  onNavItemHover,
  primaryNav
}: HeaderChromeProps) {
  return (
    <>
      <AnnouncementBar visible={announcementVisible} onDismiss={onAnnouncementDismiss} />

      <div className='relative mx-auto grid h-14 max-w-480 grid-cols-[1fr_auto_1fr] items-center px-4 md:hidden'>
        <div className='justify-self-start'>
          <HeaderMenuButton open={menuOpen} onToggle={onMenuToggle} inverted={inverted} />
        </div>
        <SukoonLogo
          variant='header'
          tone={inverted ? 'black' : 'white'}
          className='justify-self-center'
        />
        <div className='justify-self-end'>
          <HeaderTools {...toolsProps} inverted={inverted} />
        </div>
      </div>

      <div
        className={cn(
          'relative mx-auto hidden w-full max-w-480 grid-cols-[1fr_auto_1fr] px-10 md:grid',
          stackedNav ? 'h-auto items-start pt-7 pb-8' : 'h-20 items-center'
        )}
      >
        <nav
          aria-label='Primary'
          className={cn(
            'z-10 flex text-[12px] leading-3.25 tracking-[0.26px]',
            stackedNav ? 'flex-col gap-4' : 'flex-row flex-wrap items-center gap-x-5 gap-y-1',
            inverted ? 'text-sukoon-black' : 'text-white',
            menuOpen && 'pointer-events-none opacity-0'
          )}
        >
          {primaryNav.map((item) => (
            <button
              key={item.id ?? item.label}
              type='button'
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') onNavItemHover(item);
              }}
              onFocus={() => onNavItemHover(item)}
              className='w-fit cursor-pointer text-left transition-opacity hover:opacity-70'
            >
              {item.label}
            </button>
          ))}
        </nav>

        <SukoonLogo variant='header' tone={inverted ? 'black' : 'white'} className='z-20' />

        <div className='z-20 justify-self-end'>
          <HeaderTools {...toolsProps} inverted={inverted} />
        </div>
      </div>
    </>
  );
}

export function StorefrontHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { data: primaryNav } = useSuspenseQuery(resolvedNavQueryOptions('main-menu'));
  const stickyRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const [headerHeight, setHeaderHeight] = useState(96);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(!isHome);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const activeNav =
    primaryNav.find((item) => item.label === activeLabel) ??
    primaryNav.find((item) => item.categorySlug) ??
    primaryNav[0] ??
    null;
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const cartCount = useCartStore((s) => (s.hasHydrated ? s.itemCount() : 0));
  const wishlistCount = useWishlistStore((s) => (s.hasHydrated ? s.count() : 0));

  function openMenu(item?: NavPrimaryItem) {
    if (item) setActiveLabel(item.label);
    setMenuOpen(true);
    if (!isHome || window.scrollY > SHOW_AFTER_TOP) setShowSticky(true);
  }

  function toggleMenu() {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    openMenu(activeNav ?? undefined);
  }

  useEffect(() => {
    setShowSticky(!isHome || window.scrollY > SHOW_AFTER_TOP);
  }, [isHome]);

  useEffect(() => {
    const headerEl = stickyRef.current;
    if (!headerEl) return;

    function updateHeight() {
      const node = stickyRef.current;
      if (!node) return;
      setHeaderHeight(node.getBoundingClientRect().height);
    }

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      if (menuOpen || searchOpen || wishlistOpen) {
        if (!isHome || y > SHOW_AFTER_TOP) setShowSticky(true);
        lastScrollY.current = y;
        return;
      }

      if (isHome && y <= SHOW_AFTER_TOP) {
        setShowSticky(false);
      } else if (delta > SCROLL_DELTA && y > STICKY_REVEAL_Y + 80) {
        setShowSticky(false);
      } else if (
        delta < -SCROLL_DELTA ||
        (isHome && y > STICKY_REVEAL_Y && y <= STICKY_REVEAL_Y + 80)
      ) {
        setShowSticky(true);
      } else if (!isHome && y <= SHOW_AFTER_TOP) {
        setShowSticky(true);
      }

      lastScrollY.current = y;
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome, menuOpen, searchOpen, wishlistOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const toolsProps = {
    searchOpen,
    wishlistCount,
    cartCount,
    onSearch: () => {
      setWishlistOpen(false);
      setMenuOpen(false);
      setSearchOpen(true);
    },
    onWishlist: () => {
      setSearchOpen(false);
      setWishlistOpen(true);
    }
  };

  const chromeProps = {
    menuOpen,
    announcementVisible,
    onAnnouncementDismiss: () => setAnnouncementVisible(false),
    toolsProps,
    onMenuToggle: toggleMenu,
    onNavItemHover: openMenu,
    primaryNav
  };

  return (
    <>
      {isHome ? (
        <header
          className='absolute inset-x-0 top-0 z-40 w-full bg-transparent'
          data-node-id='1:215'
        >
          <HeaderChrome inverted={false} stackedNav {...chromeProps} />
        </header>
      ) : null}

      <header
        ref={stickyRef}
        className={cn(
          'fixed inset-x-0 top-0 z-50 w-full bg-white',
          'transition-transform ease-out will-change-transform',
          showSticky ? 'translate-y-0' : 'pointer-events-none -translate-y-full'
        )}
        style={{ transitionDuration: `${SLIDE_MS}ms` }}
        aria-hidden={!showSticky}
      >
        <div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/10' />
        <HeaderChrome inverted stackedNav={false} {...chromeProps} />
      </header>

      {!isHome ? <div style={{ height: headerHeight }} aria-hidden /> : null}

      <StorefrontMegaMenu
        open={menuOpen}
        activeNav={activeNav}
        onActiveNavChange={(item) => setActiveLabel(item.label)}
        onClose={() => setMenuOpen(false)}
        primaryNav={primaryNav}
        onSearch={() => {
          setMenuOpen(false);
          setSearchOpen(true);
        }}
        cartCount={cartCount}
      />
      <SearchDrawer open={searchOpen} onOpenChange={setSearchOpen} />
      <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
    </>
  );
}
