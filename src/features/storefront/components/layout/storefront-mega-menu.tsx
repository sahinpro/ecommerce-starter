'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { getCollectionBlurb } from '@/features/catalog/figma-taxonomy';
import { getCategoryNavChildren } from '@/features/catalog/service';
import type { NavChildLink, NavPrimaryItem } from '@/features/catalog/types';
import { cn } from '@/lib/utils';

type StorefrontMegaMenuProps = {
  open: boolean;
  activeNav: NavPrimaryItem | null;
  onActiveNavChange: (item: NavPrimaryItem) => void;
  onClose: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  primaryNav: NavPrimaryItem[];
};

export function StorefrontMegaMenu({
  open,
  activeNav,
  onActiveNavChange,
  onClose,
  onPointerEnter,
  onPointerLeave,
  primaryNav
}: StorefrontMegaMenuProps) {
  const [children, setChildren] = useState<NavChildLink[]>([]);
  const [mobileStack, setMobileStack] = useState<'root' | 'children'>('root');
  const [loadingChildren, setLoadingChildren] = useState(false);

  useEffect(() => {
    if (!open) {
      setMobileStack('root');
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !activeNav?.categorySlug) {
      setChildren([]);
      return;
    }

    let cancelled = false;
    setLoadingChildren(true);
    void getCategoryNavChildren(activeNav.categorySlug)
      .then((links) => {
        if (!cancelled) setChildren(links);
      })
      .catch(() => {
        if (!cancelled) {
          setChildren([{ label: 'Shop All', href: activeNav.href }]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingChildren(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeNav, open]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-[opacity,visibility] duration-300 ease-out',
        open ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
      )}
      role='dialog'
      aria-modal={open}
      aria-hidden={!open}
      aria-label='Site menu'
    >
      <button
        type='button'
        tabIndex={open ? 0 : -1}
        className={cn(
          'absolute inset-0 cursor-pointer bg-black/40 transition-opacity duration-300 ease-out',
          open ? 'opacity-100' : 'opacity-0'
        )}
        aria-label='Close menu'
        onClick={onClose}
      />

      <div
        className={cn(
          'bg-sukoon-ivory absolute inset-y-0 left-0 flex w-full max-w-[min(720px,42vw)] min-w-75',
          'transition-[opacity,transform,visibility] duration-300 ease-out will-change-transform',
          open
            ? 'visible translate-y-0 opacity-100'
            : 'invisible pointer-events-none -translate-y-1 opacity-0'
        )}
        onMouseEnter={onPointerEnter}
        onMouseLeave={onPointerLeave}
      >
        {/* Desktop: match header spacing (announcement h-10 + top-8 + gap-3 + 13px type) */}
        <div className='hidden h-full w-full md:grid md:grid-cols-[minmax(220px,280px)_1fr]'>
          <div className='flex flex-col' data-menu-level={1}>
            <div className='h-10 shrink-0' aria-hidden />
            <div className='px-10 pt-8'>
              <div className='flex flex-col gap-3'>
                <button
                  type='button'
                  onClick={onClose}
                  className='text-sukoon-black/70 flex h-4 w-fit cursor-pointer items-center text-[13px] tracking-[0.26px] transition-opacity hover:opacity-70'
                >
                  Close
                </button>
                <nav
                  aria-label='Primary categories'
                  className='flex flex-col gap-3 text-[13px] leading-3.25 tracking-[0.26px]'
                >
                  {primaryNav.map((item) => {
                    const isActive = activeNav?.label === item.label;
                    return (
                      <div key={item.label} className='relative'>
                        {isActive ? (
                          <span className='bg-sukoon-black absolute top-1/2 -left-3 size-1.5 -translate-y-1/2' />
                        ) : null}
                        {item.categorySlug ? (
                          <Link
                            href={item.href}
                            data-menu-trigger={item.categorySlug}
                            onMouseEnter={() => onActiveNavChange(item)}
                            onFocus={() => onActiveNavChange(item)}
                            onClick={onClose}
                            className={cn(
                              'nav-link block w-fit text-left transition-opacity hover:opacity-70',
                              isActive ? 'text-sukoon-black' : 'text-sukoon-black/55'
                            )}
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={onClose}
                            onMouseEnter={() => onActiveNavChange(item)}
                            className={cn(
                              'nav-link block w-fit transition-opacity hover:opacity-70',
                              isActive ? 'text-sukoon-black' : 'text-sukoon-black/55'
                            )}
                          >
                            {item.label}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          <div className='relative' data-menu-level={2}>
            <div className='h-10 shrink-0' aria-hidden />
            <div className='relative px-10 pt-8'>
              <button
                type='button'
                onClick={onClose}
                className='text-sukoon-black absolute top-8 right-8'
                aria-label='Close'
              >
                <Icons.close className='size-4' />
              </button>

              {/* Align secondary links with primary list (skip Close row + gap-3) */}
              <div className='pt-7'>
                {activeNav?.categorySlug ? (
                  <div className='flex flex-col gap-5'>
                    <ul className='flex flex-col gap-3 text-[13px] leading-3.25 tracking-[0.26px]'>
                      {loadingChildren ? (
                        <li className='text-muted-foreground'>Loading…</li>
                      ) : (
                        children.map((child) => (
                          <li key={child.href + child.label}>
                            <Link
                              href={child.href}
                              onClick={onClose}
                              className='text-sukoon-black/75 hover:text-sukoon-black cursor-pointer transition-opacity hover:opacity-70'
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))
                      )}
                    </ul>
                    {getCollectionBlurb(activeNav.categorySlug) ? (
                      <p className='text-sukoon-black/55 max-w-60 text-[12px] leading-relaxed tracking-[0.02em]'>
                        {getCollectionBlurb(activeNav.categorySlug)}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className='text-sukoon-black/65 max-w-60 text-[13px] leading-relaxed tracking-[0.26px]'>
                    Discover Sukoon — premium cloth founded in Bangladesh, loved worldwide.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: stacked with back */}
        <div className='flex h-full w-full flex-col md:hidden'>
          <div className='flex items-center justify-between border-b px-6 py-4'>
            {mobileStack === 'children' ? (
              <button
                type='button'
                className='flex items-center gap-2 text-sm'
                onClick={() => setMobileStack('root')}
              >
                <Icons.chevronLeft className='size-4' />
                Back
              </button>
            ) : (
              <span className='text-lg'>Menu</span>
            )}
            <button type='button' onClick={onClose} aria-label='Close menu'>
              <Icons.close className='size-5' />
            </button>
          </div>

          <div className='flex-1 overflow-y-auto px-6 py-8'>
            {mobileStack === 'root' ? (
              <nav className='space-y-5'>
                {primaryNav.map((item) =>
                  item.categorySlug ? (
                    <button
                      key={item.label}
                      type='button'
                      className='block w-full text-left text-xl'
                      onClick={() => {
                        onActiveNavChange(item);
                        setMobileStack('children');
                      }}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className='block text-xl'
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </nav>
            ) : (
              <div>
                <p className='mb-6 text-xl'>{activeNav?.label}</p>
                <ul className='space-y-4'>
                  {children.map((child) => (
                    <li key={child.href + child.label}>
                      <Link href={child.href} onClick={onClose} className='text-base'>
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
