'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense, useMemo, useState } from 'react';

import { Icons } from '@/components/icons';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { filterOptionsQueryOptions, productsQueryOptions } from '../../api/queries';
import type { FilterOptions, ProductFilters } from '../../api/types';
import { ProductCard } from '../product/product-card';
import { FilterPanel } from './filter-panel';
import { ShopBreadcrumb } from './shop-breadcrumb';

const EMPTY_FILTER_OPTIONS: FilterOptions = {
  sizes: [],
  colors: [],
  product_types: []
};

const SKELETON_COUNT = 8;

type ShopListingProps = {
  category?: string;
  title: string;
};

export function ShopListing({ category, title }: ShopListingProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingSizes, setPendingSizes] = useState<string[]>([]);
  const [pendingColors, setPendingColors] = useState<string[]>([]);
  const [pendingTypes, setPendingTypes] = useState<string[]>([]);

  const [params, setParams] = useQueryStates(
    {
      q: parseAsString.withDefault(''),
      view: parseAsStringLiteral(['grid', 'catalogue'] as const).withDefault('grid'),
      sort: parseAsStringLiteral(['newest', 'price_asc', 'price_desc'] as const).withDefault(
        'newest'
      ),
      sizes: parseAsString.withDefault(''),
      colors: parseAsString.withDefault(''),
      types: parseAsString.withDefault('')
    },
    { shallow: true }
  );

  const search = params.q.trim();

  const filters = useMemo(
    () => ({
      category: category ?? undefined,
      search: search || undefined,
      sort: params.sort,
      sizes: params.sizes ? params.sizes.split(',').filter(Boolean) : undefined,
      colors: params.colors ? params.colors.split(',').filter(Boolean) : undefined,
      product_types: params.types ? params.types.split(',').filter(Boolean) : undefined,
      limit: 24
    }),
    [category, params, search]
  );

  const { data: filterOptions = EMPTY_FILTER_OPTIONS } = useQuery(
    filterOptionsQueryOptions(category)
  );

  function toggleValue(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function openFilters() {
    setPendingSizes(filters.sizes ?? []);
    setPendingColors(filters.colors ?? []);
    setPendingTypes(filters.product_types ?? []);
    setFilterOpen(true);
  }

  function applyFilters() {
    void setParams({
      sizes: pendingSizes.join(','),
      colors: pendingColors.join(','),
      types: pendingTypes.join(',')
    });
    setFilterOpen(false);
  }

  function clearFilters() {
    setPendingSizes([]);
    setPendingColors([]);
    setPendingTypes([]);
    void setParams({ sizes: '', colors: '', types: '' });
  }

  return (
    <div className='px-6 py-8 md:px-6'>
      <ShopBreadcrumb
        items={
          category ? [{ label: 'Shop', href: '/shop' }, { label: title }] : [{ label: 'Shop' }]
        }
      />
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
        <h1 className={cn('font-serif text-2xl', !search && 'capitalize')}>
          {search ? `Results for “${search}”` : title}
        </h1>
        <div className='flex items-center justify-between gap-6 text-[13px] tracking-wide uppercase'>
          <button
            type='button'
            onClick={() => void setParams({ view: 'grid' })}
            className={cn(params.view === 'grid' ? 'text-foreground' : 'text-muted-foreground')}
          >
            Grid View
          </button>
          <button
            type='button'
            onClick={() => void setParams({ view: 'catalogue' })}
            className={cn(
              params.view === 'catalogue' ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            Catalogue View
          </button>

          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger
              className='border-border flex items-center gap-2 border px-3 py-1.5'
              onClick={openFilters}
            >
              Filter
              <Icons.adjustments className='size-4' />
            </SheetTrigger>
            <SheetContent side='right' className='w-full max-w-113.5 rounded-none p-0'>
              <SheetHeader className='sr-only'>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <FilterPanel
                options={filterOptions}
                selectedSizes={pendingSizes}
                selectedColors={pendingColors}
                selectedTypes={pendingTypes}
                onToggleSize={(size) => toggleValue(pendingSizes, size, setPendingSizes)}
                onToggleColor={(color) => toggleValue(pendingColors, color, setPendingColors)}
                onToggleType={(type) => toggleValue(pendingTypes, type, setPendingTypes)}
                onClearSizes={() => setPendingSizes([])}
                onClearColors={() => setPendingColors([])}
                onClearTypes={() => setPendingTypes([])}
                onApply={applyFilters}
                onClear={clearFilters}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {filterOptions.product_types.length > 0 ? (
        <nav
          aria-label='Product type'
          className='mb-8 flex flex-wrap items-center gap-x-2 gap-y-2 text-[13px] tracking-wide uppercase'
        >
          <button
            type='button'
            onClick={() => void setParams({ types: '' })}
            className={cn(
              !filters.product_types?.length
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Shop All
          </button>
          {filterOptions.product_types.map((type) => {
            const active = Boolean(filters.product_types?.includes(type));
            return (
              <span key={type} className='flex items-center gap-2'>
                <span className='text-muted-foreground' aria-hidden>
                  ·
                </span>
                <button
                  type='button'
                  onClick={() => {
                    const current = filters.product_types ?? [];
                    const next = current.includes(type)
                      ? current.filter((item) => item !== type)
                      : [...current, type];
                    void setParams({ types: next.join(',') });
                  }}
                  className={cn(
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {type}
                </button>
              </span>
            );
          })}
        </nav>
      ) : null}

      <Suspense fallback={<ProductGridSkeleton view={params.view} />}>
        <ShopProductGrid filters={filters} search={search} view={params.view} />
      </Suspense>
    </div>
  );
}

type ShopView = 'grid' | 'catalogue';

type ShopProductGridProps = {
  filters: ProductFilters;
  search: string;
  view: ShopView;
};

function ShopProductGrid({ filters, search, view }: ShopProductGridProps) {
  const { data } = useSuspenseQuery(productsQueryOptions(filters));

  if (data.products.length === 0) {
    return (
      <p className='text-muted-foreground py-20 text-center'>
        {search ? 'No products match your search.' : 'Nothing here yet.'}
      </p>
    );
  }

  return (
    <div className={productGridClassName(view)}>
      {data.products.map((product) => (
        <ProductCard key={product.id} product={product} catalogue={view === 'catalogue'} />
      ))}
    </div>
  );
}

export function ShopListingSkeleton({ view = 'grid' }: { view?: ShopView }) {
  return (
    <div className='px-6 py-8 md:px-6' aria-busy='true' aria-label='Loading products'>
      <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
        <Skeleton className='h-8 w-40 rounded-none' />
        <div className='flex items-center gap-6'>
          <Skeleton className='h-4 w-20 rounded-none' />
          <Skeleton className='h-4 w-28 rounded-none' />
          <Skeleton className='h-8 w-22 rounded-none' />
        </div>
      </div>
      <ProductGridSkeleton view={view} />
    </div>
  );
}

function ProductGridSkeleton({ view }: { view: ShopView }) {
  return (
    <div className={productGridClassName(view)} aria-hidden>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <ProductCardSkeleton key={index} catalogue={view === 'catalogue'} />
      ))}
    </div>
  );
}

function ProductCardSkeleton({ catalogue }: { catalogue: boolean }) {
  return (
    <article>
      <Skeleton
        className={cn(
          'aspect-477/636 w-full rounded-none md:h-159 md:aspect-auto',
          catalogue && 'aspect-477/718 md:h-auto md:aspect-477/718'
        )}
      />
      <div className='mt-4 flex items-start justify-between gap-3 px-4'>
        <Skeleton className='h-4 w-28 rounded-none' />
        <Skeleton className='h-4 w-14 rounded-none' />
      </div>
      <div className='mt-2 flex items-center gap-1.5 px-4'>
        <Skeleton className='size-3 rounded-none' />
        <Skeleton className='size-3 rounded-none' />
        <Skeleton className='size-3 rounded-none' />
      </div>
    </article>
  );
}

function productGridClassName(view: ShopView): string {
  return cn(
    'grid gap-x-4 gap-y-10',
    view === 'grid' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'
  );
}
