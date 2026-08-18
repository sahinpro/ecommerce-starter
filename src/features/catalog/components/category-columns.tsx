'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { getSelectColumn } from '@/components/ui/table/data-table-select-column';
import { TableImage } from '@/components/ui/table/table-image';

import type { AdminCategory } from '../service';
import { CategoryCellAction } from './category-cell-action';

export const categoryColumns: ColumnDef<AdminCategory>[] = [
  getSelectColumn<AdminCategory>(),
  {
    id: 'image',
    accessorFn: (row) => row.image_url ?? '',
    header: 'Image',
    enableSorting: false,
    size: 56,
    minSize: 56,
    maxSize: 56,
    meta: { shrink: true },
    cell: ({ row }) => <TableImage src={row.original.image_url} alt={row.original.name} />
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
    cell: ({ row }) => (
      <div>
        <p className='font-medium'>{row.original.name}</p>
        <p className='text-muted-foreground text-xs'>{row.original.slug}</p>
      </div>
    ),
    meta: {
      label: 'Name',
      placeholder: 'Search categories...',
      variant: 'text',
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'product_count',
    accessorKey: 'product_count',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Products' />,
    cell: ({ row }) => <span className='tabular-nums'>{row.original.product_count}</span>
  },
  {
    id: 'sort_order',
    accessorKey: 'sort_order',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Sort' />,
    cell: ({ row }) => <span className='tabular-nums'>{row.original.sort_order}</span>
  },
  {
    id: 'actions',
    size: 48,
    minSize: 48,
    maxSize: 48,
    enableSorting: false,
    enableHiding: false,
    meta: { shrink: true },
    cell: ({ row }) => <CategoryCellAction data={row.original} />
  }
];
