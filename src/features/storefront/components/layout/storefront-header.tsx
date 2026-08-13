'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Icons } from '@/components/icons';
import { PRIMARY_NAV } from '@/features/catalog/constants';
import type { NavPrimaryItem } from '@/features/catalog/types';
import { cn } from '@/lib/utils';

import { useCartStore } from '../../utils/cart-store';
import { useWishlistStore } from '../../utils/wishlist-store';
import { StorefrontIcon } from '../brand/storefront-icon';
import { SukoonLogo } from '../brand/sukoon-logo';
import { WishlistDrawer } from '../wishlist/wishlist-drawer';
import { AnnouncementBar } from './announcement-bar';
import { StorefrontMegaMenu } from './storefront-mega-menu';

const currencies = ['BDT', 'USD'] as const;
const CLOSE_DELAY_MS = 220;

export function StorefrontHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<NavPrimaryItem | null>(
    PRIMARY_NAV.find((item) => item.categorySlug) ?? PRIMARY_NAV[0] ?? null
  );
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [currency, setCurrency] = useState<(typeof currencies)[number]>('BDT');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const cartCount = useCartStore((s) => (s.hasHydrated ? s.itemCount() : 0));
  const wishlistCount = useWishlistStore((s) => (s.hasHydrated ? s.count() : 0));
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openMenu(item?: NavPrimaryItem) {
    clearCloseTimer();
    if (item) setActiveNav(item);
    setMenuOpen(true);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, CLOSE_DELAY_MS);
  }

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  return (
    <>
      <header
        className={cn(
          'relative z-40 w-full',
          isHome ? 'absolute inset-x-0 top-0' : 'bg-sukoon-black sticky top-0'
        )}
        data-node-id='1:215'
        onMouseLeave={scheduleClose}
      >
        <AnnouncementBar />

        <div
          className={cn(
            'relative mx-auto h-40 max-w-[1920px] px-10 text-white',
            !isHome && 'bg-sukoon-black'
          )}
        >
          <SukoonLogo variant='header' className='absolute top-7 left-1/2 z-10 -translate-x-1/2' />

          <div
            className='absolute top-8 left-10 flex flex-col gap-3'
            onMouseEnter={clearCloseTimer}
          >
            <button
              type='button'
              onClick={() => openMenu(activeNav ?? undefined)}
              onMouseEnter={() => openMenu(activeNav ?? undefined)}
              className='flex w-fit cursor-pointer items-center gap-2 text-[13px] tracking-[0.26px] transition-opacity hover:opacity-70'
              aria-label='Open menu'
              aria-expanded={menuOpen}
            >
              <Icons.menu className='size-4' />
              <span>Menu</span>
            </button>

            <nav
              className='hidden flex-col gap-3 text-[13px] leading-3.25 tracking-[0.26px] lg:flex'
              aria-label='Primary'
            >
              {PRIMARY_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className='w-fit cursor-pointer transition-opacity hover:opacity-70'
                  onMouseEnter={() => openMenu(link)}
                  onFocus={() => openMenu(link)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className='absolute top-8 right-10 flex items-start gap-3.5'>
            <div className='relative'>
              <button
                type='button'
                onClick={() => setCurrencyOpen((open) => !open)}
                className='flex h-3.75 cursor-pointer items-center gap-1 text-[13px] leading-3.25 tracking-[0.26px]'
                aria-label='Select currency'
                aria-expanded={currencyOpen}
              >
                <span>{currency}</span>
                <StorefrontIcon name='currencyChevron' className='h-3.25 w-3' />
              </button>
              {currencyOpen ? (
                <div className='bg-sukoon-black absolute top-6 right-0 min-w-18 border border-white/20 py-1 text-[12px]'>
                  {currencies.map((code) => (
                    <button
                      key={code}
                      type='button'
                      className='block w-full cursor-pointer px-3 py-1.5 text-left hover:bg-white/10'
                      onClick={() => {
                        setCurrency(code);
                        setCurrencyOpen(false);
                      }}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className='flex h-4.5 items-center gap-4'>
              <button type='button' aria-label='Search' className='relative cursor-pointer'>
                <StorefrontIcon name='search' className='h-[14.11px] w-4' />
              </button>
              <span
                aria-label='Account'
                className='inline-flex'
                title='Guest checkout — no account needed'
              >
                <StorefrontIcon name='account' className='h-4.5 w-4' />
              </span>
              <button
                type='button'
                onClick={() => setWishlistOpen(true)}
                className='relative cursor-pointer'
                aria-label='Wishlist'
              >
                <StorefrontIcon name='wishlist' className='h-[14.22px] w-4' />
                {wishlistCount > 0 ? (
                  <span className='absolute -top-2 -right-2 flex size-4 items-center justify-center bg-white text-[10px] text-black'>
                    {wishlistCount}
                  </span>
                ) : null}
              </button>
              <Link href='/cart' className='relative cursor-pointer' aria-label='Cart'>
                <StorefrontIcon name='bag' className='size-4' />
                {cartCount > 0 ? (
                  <span className='absolute -top-2 -right-2 flex size-4 items-center justify-center bg-white text-[10px] text-black'>
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <StorefrontMegaMenu
        open={menuOpen}
        activeNav={activeNav}
        onActiveNavChange={setActiveNav}
        onClose={() => setMenuOpen(false)}
        onPointerEnter={clearCloseTimer}
        onPointerLeave={scheduleClose}
        primaryNav={PRIMARY_NAV}
      />
      <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
    </>
  );
}
