'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

import { NAV_LINKS } from '../../constants/mock-data';
import { useCartStore } from '../../utils/cart-store';
import { useWishlistStore } from '../../utils/wishlist-store';
import { SukoonLogo } from '../brand/sukoon-logo';
import { WishlistDrawer } from '../wishlist/wishlist-drawer';

export function StorefrontHeader() {
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const cartCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.count());

  return (
    <>
      <header className='border-border sticky top-0 z-40 border-b bg-white'>
        <div className='mx-auto grid h-[160px] max-w-[1920px] grid-cols-[1fr_auto_1fr] items-start px-10 pt-[72px] pb-6'>
          <nav className='flex flex-col gap-3 text-[13px] tracking-wide uppercase'>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className='text-foreground/80 hover:text-foreground w-fit transition-colors'
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <SukoonLogo className='justify-self-center text-2xl' />

          <div className='flex items-start justify-end gap-5'>
            <button
              type='button'
              className='text-foreground/80 hover:text-foreground transition-colors'
              aria-label='Search'
            >
              <Icons.search className='size-4' />
            </button>
            <Link
              href='/auth/sign-in'
              className='text-foreground/80 hover:text-foreground transition-colors'
              aria-label='Account'
            >
              <Icons.user className='size-4' />
            </Link>
            <button
              type='button'
              onClick={() => setWishlistOpen(true)}
              className='text-foreground/80 hover:text-foreground relative transition-colors'
              aria-label='Wishlist'
            >
              <Icons.heart className='size-4' />
              {wishlistCount > 0 ? (
                <span className='bg-primary text-primary-foreground absolute -top-1.5 -right-2 flex size-4 items-center justify-center text-[10px]'>
                  {wishlistCount}
                </span>
              ) : null}
            </button>
            <Link
              href='/cart'
              className='text-foreground/80 hover:text-foreground relative transition-colors'
              aria-label='Cart'
            >
              <Icons.shoppingBag className='size-4' />
              {cartCount > 0 ? (
                <span className='bg-primary text-primary-foreground absolute -top-1.5 -right-2 flex size-4 items-center justify-center text-[10px]'>
                  {cartCount}
                </span>
              ) : null}
            </Link>
            <span className='text-foreground/80 ml-2 text-[13px] tracking-wide uppercase'>
              BDT
            </span>
          </div>
        </div>
      </header>

      <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} />
    </>
  );
}
