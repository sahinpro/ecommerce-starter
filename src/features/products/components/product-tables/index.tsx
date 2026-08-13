'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type { SortingState } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import { cn } from '@/lib/utils';

import { categoriesQueryOptions, productsQueryOptions } from '../../api/queries';
import type { ProductFilters } from '../../api/types';
import { getProductColumns } from './columns';

function mapTableSort(sort: SortingState): ProductFilters['sort'] {
  const first = sort[0];
  if (!first) return 'newest';
  if (first.id === 'price') return first.desc ? 'price_desc' : 'price_asc';
  if (first.id === 'name') return first.desc ? 'newest' : 'name_asc';
  return 'newest';
}

export function ProductTable() {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.name, value: category.slug })),
    [categories]
  );

  const columns = useMemo(() => getProductColumns(categoryOptions), [categoryOptions]);
  const columnIds = useMemo(
    () => columns.map((column) => column.id).filter(Boolean) as string[],
    [columns]
  );

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    category: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([])
  });

  const filters: ProductFilters = {
    page: params.page,
    limit: params.perPage,
    status: 'all',
    sort: mapTableSort(params.sort),
    ...(params.name && { search: params.name }),
    ...(params.category && { category: params.category })
  };

  const { data } = useSuspenseQuery(productsQueryOptions(filters));
  const pageCount = Math.max(1, Math.ceil(data.total / params.perPage));
  const isEmptyCatalog = data.total === 0 && !params.name && !params.category;

  const { table } = useDataTable({
    data: data.products,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  if (isEmptyCatalog) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-16 text-center'>
        <div className='bg-muted flex size-12 items-center justify-center rounded-full'>
          <Icons.product className='text-muted-foreground size-5' />
        </div>
        <div className='space-y-1'>
          <h3 className='text-lg font-semibold'>Add your first product</h3>
          <p className='text-muted-foreground max-w-sm text-sm'>
            Start building the Sukoon catalog with a product, image, color, and variants.
          </p>
        </div>
        <Link href='/dashboard/product/new' className={cn(buttonVariants())}>
          <Icons.add className='mr-2 h-4 w-4' /> Add product
        </Link>
      </div>
    );
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
