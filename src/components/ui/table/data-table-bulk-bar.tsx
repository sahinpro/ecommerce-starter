'use client';

import type { ReactNode } from 'react';
import type { Table } from '@tanstack/react-table';

export function DataTableBulkBar<TData>({
  table,
  children
}: {
  table: Table<TData>;
  children?: ReactNode;
}) {
  const selected = table.getFilteredSelectedRowModel().rows.length;
  if (selected === 0) return null;

  return (
    <div className='bg-card flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm'>
      <p className='font-medium'>
        {selected} selected
        <span className='text-muted-foreground font-normal'> — choose a bulk action</span>
      </p>
      <div className='flex flex-wrap items-center gap-2'>{children}</div>
    </div>
  );
}
