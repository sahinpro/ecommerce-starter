'use client';

import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';

import { adminCategoriesQueryOptions } from '../queries';
import { categoryColumns } from './category-columns';
import { CategoryFormSheet } from './category-form';

const columnIds = categoryColumns.map((column) => column.id).filter(Boolean) as string[];

export function CategoryTable() {
  const { data } = useSuspenseQuery(adminCategoriesQueryOptions());
  const [createOpen, setCreateOpen] = useState(false);

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([])
  });

  const filtered = params.name
    ? data.filter((category) => {
        const q = params.name!.toLowerCase();
        return category.name.toLowerCase().includes(q) || category.slug.toLowerCase().includes(q);
      })
    : data;

  const pageCount = Math.max(1, Math.ceil(filtered.length / params.perPage));

  const { table } = useDataTable({
    data: filtered,
    columns: categoryColumns,
    pageCount,
    shallow: true,
    debounceMs: 300,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  if (data.length === 0) {
    return (
      <>
        <div className='bg-card flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-16 text-center'>
          <div className='bg-muted flex size-12 items-center justify-center rounded-full'>
            <Icons.category className='text-muted-foreground size-5' />
          </div>
          <div>
            <h3 className='text-base font-medium'>No categories yet</h3>
            <p className='text-muted-foreground mt-1 max-w-sm text-sm'>
              Add your first category to start organizing the Sukoon catalog.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Icons.add className='mr-2 h-4 w-4' /> Add category
          </Button>
        </div>
        <CategoryFormSheet open={createOpen} onOpenChange={setCreateOpen} />
      </>
    );
  }

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <CategoryFormSheet open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}

export function CategoryTableSkeleton() {
  return (
    <div className='flex flex-col gap-4 p-1'>
      <div className='bg-muted h-10 w-full rounded-md' />
      <div className='bg-muted h-96 w-full rounded-lg' />
    </div>
  );
}

export function AddCategoryButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} className='text-xs md:text-sm'>
        <Icons.add className='mr-2 h-4 w-4' /> Add New
      </Button>
      <CategoryFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
