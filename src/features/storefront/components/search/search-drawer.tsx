'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { Icons } from '@/components/icons';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FIGMA_PRIMARY_CATEGORIES } from '@/features/catalog/figma-taxonomy';
import { useDebounce } from '@/hooks/use-debounce';

import { productsQueryOptions } from '../../api/queries';
import { formatPrice } from '../../utils/format-price';

const MIN_QUERY_LENGTH = 2;

type SearchDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SearchDrawer({ open, onOpenChange }: SearchDrawerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 280);
  const canSearch = debouncedQuery.length >= MIN_QUERY_LENGTH;

  const { data, isFetching } = useQuery({
    ...productsQueryOptions({ search: debouncedQuery, limit: 8 }),
    enabled: open && canSearch,
    placeholderData: keepPreviousData
  });

  const products = data?.products ?? [];

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  function close() {
    onOpenChange(false);
  }

  function goToResults(term: string) {
    const next = term.trim();
    if (!next) return;
    close();
    router.push(`/shop?q=${encodeURIComponent(next)}`);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='top' className='max-h-[min(80vh,720px)] w-full gap-0 rounded-none p-0'>
        <SheetHeader className='border-border space-y-0 border-b px-5 py-6 pr-14 md:px-10'>
          <SheetTitle className='sr-only'>Search the shop</SheetTitle>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              goToResults(query);
            }}
          >
            <label className='flex items-center gap-3 border-b border-black/40'>
              <Icons.search className='size-4 shrink-0' />
              <span className='sr-only'>Search products</span>
              <input
                ref={inputRef}
                type='search'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Search cashmere, collections, tees…'
                className='h-12 w-full bg-transparent text-[15px] tracking-[0.28px] outline-none placeholder:text-black/40'
                autoComplete='off'
                enterKeyHint='search'
              />
            </label>
          </form>
        </SheetHeader>

        <div className='overflow-y-auto px-5 py-6 md:px-10'>
          <p className='text-[11px] tracking-[0.28px] uppercase'>Collections</p>
          <nav className='mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[13px] tracking-[0.26px] uppercase'>
            {FIGMA_PRIMARY_CATEGORIES.map((item) => (
              <Link key={item.slug} href={item.href} onClick={close} className='hover:opacity-60'>
                {item.name}
              </Link>
            ))}
            <Link href='/shop' onClick={close} className='hover:opacity-60'>
              Shop all
            </Link>
          </nav>

          {query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH ? (
            <p className='text-muted-foreground mt-8 text-sm'>Type at least two characters.</p>
          ) : null}

          {canSearch ? (
            <div className='mt-8'>
              <div className='mb-4 flex items-baseline justify-between gap-4'>
                <p className='text-[11px] tracking-[0.28px] uppercase'>
                  {isFetching && products.length === 0 ? 'Searching' : 'Products'}
                </p>
                {data && data.total > 0 ? (
                  <button
                    type='button'
                    onClick={() => goToResults(debouncedQuery)}
                    className='text-[12px] tracking-[0.24px] uppercase underline underline-offset-4 hover:opacity-60'
                  >
                    View all {data.total}
                  </button>
                ) : null}
              </div>

              {products.length === 0 && !isFetching ? (
                <p className='text-muted-foreground text-sm'>No products match that search.</p>
              ) : (
                <ul className='space-y-4'>
                  {products.map((product) => {
                    const image = product.images[0];
                    return (
                      <li key={product.id}>
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={close}
                          className='flex gap-4'
                        >
                          <span className='bg-muted relative size-16 shrink-0 overflow-hidden'>
                            {image ? (
                              <Image
                                src={image.url}
                                alt={image.alt ?? product.name}
                                fill
                                className='object-cover'
                                sizes='64px'
                              />
                            ) : null}
                          </span>
                          <span className='flex min-w-0 flex-1 items-start justify-between gap-4'>
                            <span className='text-[13px] tracking-[0.26px] uppercase'>
                              {product.name}
                            </span>
                            <span className='shrink-0 text-[13px] tracking-[0.26px] uppercase'>
                              {formatPrice(product.price)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
