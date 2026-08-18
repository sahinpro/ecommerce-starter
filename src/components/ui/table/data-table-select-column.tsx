'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { Checkbox } from '@/components/ui/checkbox';

export function getSelectColumn<TData>(): ColumnDef<TData> {
  return {
    id: 'select',
    size: 40,
    minSize: 40,
    maxSize: 40,
    meta: { shrink: true },
    header: ({ table }) => (
      <Checkbox
        aria-label='Select all rows on this page'
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked) => {
          table.toggleAllPageRowsSelected(Boolean(checked));
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label='Select row'
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => {
          row.toggleSelected(Boolean(checked));
        }}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false
  };
}
