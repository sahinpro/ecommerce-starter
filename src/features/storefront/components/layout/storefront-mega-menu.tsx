'use client';

import Link from 'next/link';
import { useEffect, useState, type MouseEvent } from 'react';

import { Icons } from '@/components/icons';
import type { NavChildLink, NavPrimaryItem } from '@/features/catalog/types';
import { cn } from '@/lib/utils';

import { StorefrontIcon } from '../brand/storefront-icon';
import { SukoonLogo } from '../brand/sukoon-logo';

const FADE_MS = 300;
const SLIDE_MS = 300;

type StorefrontMegaMenuProps = {
  open: boolean;
  activeNav: NavPrimaryItem | null;
  onActiveNavChange: (item: NavPrimaryItem) => void;
  onClose: () => void;
  primaryNav: NavPrimaryItem[];
  onSearch?: () => void;
  cartCount?: number;
};

function navChildrenFor(item: NavPrimaryItem | null): NavChildLink[] {
  if (!item) return [];
  if (item.children?.length) return item.children;
  if (item.categorySlug) {
    return [{ label: 'Shop All', href: item.href }];
  }
  return [{ label: item.label, href: item.href }];
}

export function StorefrontMegaMenu({
  open,
  activeNav,
  onActiveNavChange,
  onClose,
  primaryNav,
  onSearch,
  cartCount = 0
}: StorefrontMegaMenuProps) {
  const [mobileStack, setMobileStack] = useState<'root' | 'children'>('root');
  const children = navChildrenFor(activeNav);

  useEffect(() => {
    if (open) return;
    const resetTimer = window.setTimeout(() => setMobileStack('root'), FADE_MS);
    return () => window.clearTimeout(resetTimer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  function openSubmenu(item: NavPrimaryItem, event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onActiveNavChange(item);
    setMobileStack('children');
  }

  return (
    <div
      className='pointer-events-none fixed inset-0 z-60'
      role='dialog'
      aria-modal={open}
      aria-hidden={!open}
      aria-label='Site menu'
    >
      <button
        type='button'
        tabIndex={open ? 0 : -1}
        className={cn(
          'absolute inset-0 hidden cursor-pointer bg-black/40 transition-opacity duration-300 ease-out md:block',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-label='Close menu'
        onClick={onClose}
      />

      <div
        className={cn(
          'absolute inset-y-0 left-0 hidden w-full max-w-[min(520px,38vw)] min-w-75 bg-white md:flex',
          'transition-opacity duration-350 ease-out',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <button
          type='button'
          onClick={onClose}
          className='text-sukoon-black absolute top-7 right-8 z-10 cursor-pointer transition-opacity hover:opacity-70'
          aria-label='Close menu'
        >
          <Icons.close className='size-4' />
        </button>

        <div className='grid h-full w-full md:grid-cols-[minmax(180px,220px)_1fr]'>
          <div className='flex flex-col' data-menu-level={1}>
            <div className='h-10 shrink-0' aria-hidden />
            <div className='px-10 pt-7'>
              <nav
                aria-label='Primary categories'
                className='flex flex-col gap-3 text-[13px] leading-3.25 tracking-[0.26px]'
              >
                {primaryNav.map((item) => {
                  const isActive = activeNav?.label === item.label;
                  return (
                    <div key={item.id ?? item.label} className='relative'>
                      {isActive ? (
                        <span className='bg-sukoon-black absolute top-1/2 -left-3 size-1.5 -translate-y-1/2' />
                      ) : null}
                      <button
                        type='button'
                        data-menu-trigger={item.categorySlug}
                        onClick={() => onActiveNavChange(item)}
                        className={cn(
                          'nav-link block w-fit cursor-pointer text-left transition-opacity hover:opacity-70',
                          isActive ? 'text-sukoon-black' : 'text-sukoon-black/55'
                        )}
                      >
                        {item.label}
                      </button>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className='relative' data-menu-level={2}>
            <div className='h-10 shrink-0' aria-hidden />
            <div className='px-10 pt-7'>
              {activeNav?.children?.length || activeNav?.categorySlug || activeNav?.blurb ? (
                <div className='flex flex-col gap-5'>
                  <ul className='flex flex-col gap-3 text-[12px] leading-3.25 tracking-[0.26px]'>
                    {children.map((child) => (
                      <li key={child.href + child.label}>
                        <Link
                          href={child.href}
                          onClick={onClose}
                          className='text-sukoon-black/75 hover:text-sukoon-black cursor-pointer transition-opacity hover:opacity-70'
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {activeNav?.blurb ? (
                    <p className='text-sukoon-black/55 max-w-60 text-[12px] leading-relaxed tracking-[0.02em]'>
                      {activeNav.blurb}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className='text-sukoon-black/65 max-w-60 text-[13px] leading-relaxed tracking-[0.26px]'>
                  Discover Sukoon — premium cloth from Dhaka, crafted in Bangladesh.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: full-screen white panel */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col bg-white text-sukoon-black md:hidden',
          'transition-opacity duration-300 ease-out',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className='grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-black/10 px-4'>
          <button
            type='button'
            onClick={onClose}
            className='justify-self-start text-[14px] tracking-[0.04em] underline decoration-1 underline-offset-1.25'
          >
            Close
          </button>
          <SukoonLogo
            variant='header'
            tone='black'
            className='justify-self-center'
            href='/'
            onClick={onClose}
          />
          <div className='flex items-center justify-self-end gap-3.5'>
            <button
              type='button'
              aria-label='Search'
              className='cursor-pointer'
              onClick={() => onSearch?.()}
            >
              <StorefrontIcon name='search' tone='dark' className='h-[14.11px] w-4' />
            </button>
            <Link
              href='/cart'
              className='relative cursor-pointer'
              aria-label='Shopping bag'
              onClick={onClose}
            >
              <StorefrontIcon name='bag' tone='dark' className='size-4.5' />
              {cartCount > 0 ? (
                <span className='bg-sukoon-black absolute -top-2 -right-2 flex size-4 items-center justify-center text-[10px] text-white'>
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        <div className='relative min-h-0 flex-1 overflow-hidden'>
          <div
            className={cn(
              'flex h-full w-[200%] ease-out',
              mobileStack === 'children' ? '-translate-x-1/2' : 'translate-x-0'
            )}
            style={{ transition: `transform ${SLIDE_MS}ms ease-out` }}
          >
            <nav
              className='flex h-full w-1/2 flex-col gap-4 overflow-y-auto px-6 pt-10 pb-12'
              aria-label='Primary categories'
            >
              {primaryNav.map((item) => (
                <button
                  key={item.id ?? item.label}
                  type='button'
                  className='flex w-full items-center justify-between text-left text-[17px] tracking-[0.02em]'
                  onClick={(event) => openSubmenu(item, event)}
                >
                  <span>{item.label}</span>
                  <Icons.chevronRight className='text-sukoon-black/35 size-5 stroke-[1.25]' />
                </button>
              ))}
            </nav>

            <div className='h-full w-1/2 overflow-y-auto px-6 pt-10 pb-12'>
              <button
                type='button'
                className='mb-8 flex items-center gap-1.5 text-[13px] tracking-[0.04em]'
                onClick={() => setMobileStack('root')}
              >
                <Icons.chevronLeft className='size-4' />
                Back
              </button>
              <p className='mb-8 text-[22px] leading-none tracking-[0.02em]'>{activeNav?.label}</p>
              <ul className='space-y-6'>
                {children.map((child) => (
                  <li key={child.href + child.label}>
                    <Link
                      href={child.href}
                      onClick={onClose}
                      className='block text-[17px] tracking-[0.02em]'
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
