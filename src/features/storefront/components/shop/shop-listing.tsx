'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';

import { Icons } from '@/components/icons';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { filterOptionsQueryOptions, productsQueryOptions } from '../../api/queries';
import { ProductCard } from '../product/product-card';
import { FilterPanel } from './filter-panel';

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

  const filters = useMemo(
    () => ({
      category: category ?? undefined,
      sort: params.sort,
      sizes: params.sizes ? params.sizes.split(',').filter(Boolean) : undefined,
      colors: params.colors ? params.colors.split(',').filter(Boolean) : undefined,
      product_types: params.types ? params.types.split(',').filter(Boolean) : undefined,
      limit: 24
    }),
    [category, params]
  );

  const { data } = useSuspenseQuery(productsQueryOptions(filters));
  const { data: filterOptions } = useSuspenseQuery(filterOptionsQueryOptions(category));

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
    <div className='px-10 py-8'>
      <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
        <h1 className='font-serif text-2xl capitalize'>{title}</h1>
        <div className='flex items-center gap-6 text-[13px] tracking-wide uppercase'>
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
            <SheetContent side='right' className='w-full max-w-[454px] rounded-none p-0'>
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
                onApply={applyFilters}
                onClear={clearFilters}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div
        className={cn(
          'grid gap-x-4 gap-y-10',
          params.view === 'grid' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'
        )}
      >
        {data.products.map((product) => (
          <ProductCard key={product.id} product={product} catalogue={params.view === 'catalogue'} />
        ))}
      </div>

      {data.products.length === 0 ? (
        <p className='text-muted-foreground py-20 text-center'>Nothing here yet.</p>
      ) : null}
    </div>
  );
}
