'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import type { SortingState } from '@tanstack/react-table';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button, buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableBulkBar } from '@/components/ui/table/data-table-bulk-bar';
import { DataTableStatusTabs } from '@/components/ui/table/data-table-status-tabs';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import { cn } from '@/lib/utils';

import { revalidateCatalogAction } from '@/features/catalog/actions';
import { catalogKeys } from '@/features/catalog/queries';
import { getQueryClient } from '@/lib/query-client';

import { archiveProduct, restoreProduct } from '../../api/service';
import { categoriesQueryOptions, productsQueryOptions } from '../../api/queries';
import type { ProductFilters, ProductStatus } from '../../api/types';
import { getProductColumns } from './columns';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' }
] as const;

function mapTableSort(sort: SortingState): ProductFilters['sort'] {
  const first = sort[0];
  if (!first) return 'newest';
  if (first.id === 'price') return first.desc ? 'price_desc' : 'price_asc';
  if (first.id === 'name') return first.desc ? 'newest' : 'name_asc';
  return 'newest';
}

export function ProductTable() {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());
  const [archiveOpen, setArchiveOpen] = useState(false);

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.name, value: category.slug })),
    [categories]
  );

  const columns = useMemo(() => getProductColumns(categoryOptions), [categoryOptions]);
  const columnIds = useMemo(
    () => columns.map((column) => column.id).filter(Boolean) as string[],
    [columns]
  );

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    category: parseAsString,
    status: parseAsStringLiteral(['all', 'active', 'draft', 'archived'] as const).withDefault(
      'all'
    ),
    sort: getSortingStateParser(columnIds).withDefault([])
  });

  const filters: ProductFilters = {
    page: params.page,
    limit: params.perPage,
    status: params.status,
    sort: mapTableSort(params.sort),
    ...(params.name && { search: params.name }),
    ...(params.category && { category: params.category })
  };

  const { data } = useSuspenseQuery(productsQueryOptions(filters));
  const pageCount = Math.max(1, Math.ceil(data.total / params.perPage));
  const isEmptyCatalog =
    data.total === 0 && !params.name && !params.category && params.status === 'all';

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

  const archiveMutation = useMutation({
    mutationFn: async (products: { id: string; slug: string; category_slug: string | null }[]) => {
      await Promise.all(products.map((item) => archiveProduct(item.id)));
      await Promise.all(
        products.map((item) => revalidateCatalogAction(item.slug, item.category_slug))
      );
    },
    onSuccess: () => {
      void getQueryClient().invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Selected products archived');
      table.resetRowSelection();
      setArchiveOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to archive products');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: async (products: { id: string; slug: string; category_slug: string | null }[]) => {
      await Promise.all(products.map((item) => restoreProduct(item.id)));
      await Promise.all(
        products.map((item) => revalidateCatalogAction(item.slug, item.category_slug))
      );
    },
    onSuccess: () => {
      void getQueryClient().invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Selected products restored as drafts');
      table.resetRowSelection();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to restore products');
    }
  });

  if (isEmptyCatalog) {
    return (
      <div className='bg-card flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-16 text-center'>
        <div className='bg-muted flex size-12 items-center justify-center rounded-full'>
          <Icons.product className='text-muted-foreground size-5' />
        </div>
        <div>
          <h3 className='text-base font-medium'>Add your first product</h3>
          <p className='text-muted-foreground mt-1 max-w-sm text-sm'>
            Start building the Sukoon catalog with a product, image, color, and variants.
          </p>
        </div>
        <Link href='/dashboard/product/new' className={cn(buttonVariants())}>
          <Icons.add className='mr-2 h-4 w-4' /> Add product
        </Link>
      </div>
    );
  }

  const selectedProducts = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  const onArchivedTab = params.status === 'archived';

  return (
    <div className='flex flex-1 flex-col gap-3'>
      <AlertModal
        isOpen={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() => archiveMutation.mutate(selectedProducts)}
        loading={archiveMutation.isPending}
        title='Archive selected products?'
        description='Archived products are hidden from the storefront. You can restore them anytime.'
        confirmLabel='Archive'
      />
      <DataTableStatusTabs
        value={params.status}
        options={STATUS_TABS}
        onChange={(status) => {
          void setParams({ status: status as ProductStatus | 'all', page: 1 });
        }}
      />
      <DataTable
        table={table}
        actionBar={
          <DataTableBulkBar table={table}>
            {onArchivedTab ? (
              <Button
                variant='outline'
                size='sm'
                isLoading={restoreMutation.isPending}
                onClick={() => restoreMutation.mutate(selectedProducts)}
              >
                <Icons.restore />
                Restore
              </Button>
            ) : (
              <Button variant='outline' size='sm' onClick={() => setArchiveOpen(true)}>
                <Icons.archive />
                Archive
              </Button>
            )}
          </DataTableBulkBar>
        }
      >
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
