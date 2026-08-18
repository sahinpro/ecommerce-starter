'use client';

import Link from 'next/link';
import type { Column, ColumnDef } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { getSelectColumn } from '@/components/ui/table/data-table-select-column';
import { TableImage } from '@/components/ui/table/table-image';

import type { Product } from '../../api/types';
import {
  formatProductDate,
  formatProductPrice,
  sumVariantStock
} from '../../constants/product-options';
import { CellAction } from './cell-action';

type CategoryOption = { label: string; value: string };

export function getProductColumns(categoryOptions: CategoryOption[]): ColumnDef<Product>[] {
  return [
    getSelectColumn<Product>(),
    {
      id: 'image',
      accessorFn: (row) => row.images[0]?.url ?? '',
      header: 'Image',
      enableSorting: false,
      size: 56,
      minSize: 56,
      maxSize: 56,
      meta: { shrink: true },
      cell: ({ row }) => {
        const image = row.original.images[0];
        return <TableImage src={image?.url} alt={image?.alt || row.original.name} />;
      }
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }: { column: Column<Product, unknown> }) => (
        <DataTableColumnHeader column={column} title='Product' />
      ),
      cell: ({ row }) => (
        <div className='max-w-55'>
          <Link
            href={`/dashboard/product/${row.original.slug}`}
            className='truncate font-medium hover:underline'
          >
            {row.original.name}
          </Link>
          <p className='text-muted-foreground truncate text-xs'>
            {row.original.sku ? `SKU ${row.original.sku}` : row.original.slug}
          </p>
        </div>
      ),
      meta: {
        label: 'Name',
        placeholder: 'Search products...',
        variant: 'text',
        icon: Icons.text
      },
      enableColumnFilter: true
    },
    {
      id: 'category',
      accessorKey: 'category_name',
      enableSorting: false,
      header: ({ column }: { column: Column<Product, unknown> }) => (
        <DataTableColumnHeader column={column} title='Category' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>{row.original.category_name ?? '—'}</span>
      ),
      enableColumnFilter: true,
      meta: {
        label: 'Category',
        variant: 'select',
        options: categoryOptions
      }
    },
    {
      id: 'price',
      accessorKey: 'price',
      header: ({ column }: { column: Column<Product, unknown> }) => (
        <DataTableColumnHeader column={column} title='Price' />
      ),
      cell: ({ row }) => (
        <span className='tabular-nums'>{formatProductPrice(row.original.price)}</span>
      )
    },
    {
      id: 'status',
      accessorKey: 'status',
      enableSorting: false,
      header: ({ column }: { column: Column<Product, unknown> }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      id: 'stock',
      accessorFn: (row) => sumVariantStock(row.variants),
      enableSorting: false,
      header: 'Stock',
      cell: ({ row }) => {
        const stock = sumVariantStock(row.original.variants);
        const tone = stock <= 0 ? 'danger' : stock <= 5 ? 'warning' : 'success';
        return (
          <div className='flex items-center gap-2'>
            <span className='tabular-nums'>{stock}</span>
            {stock <= 5 ? (
              <StatusBadge tone={tone}>{stock <= 0 ? 'Out' : 'Low'}</StatusBadge>
            ) : null}
          </div>
        );
      }
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: ({ column }: { column: Column<Product, unknown> }) => (
        <DataTableColumnHeader column={column} title='Created' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground'>{formatProductDate(row.original.created_at)}</span>
      )
    },
    {
      id: 'actions',
      size: 48,
      minSize: 48,
      maxSize: 48,
      enableSorting: false,
      enableHiding: false,
      meta: { shrink: true },
      cell: ({ row }) => <CellAction data={row.original} />
    }
  ];
}
