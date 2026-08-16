'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Column, ColumnDef } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';

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
    {
      id: 'image',
      accessorFn: (row) => row.images[0]?.url ?? '',
      header: 'Image',
      enableSorting: false,
      cell: ({ row }) => {
        const image = row.original.images[0];
        if (!image?.url) {
          return (
            <div className='bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-md'>
              <Icons.media className='size-4' />
            </div>
          );
        }
        return (
          <div className='relative size-12 overflow-hidden rounded-md border'>
            <Image
              src={image.url}
              alt={image.alt || row.original.name}
              fill
              sizes='48px'
              className='object-cover'
            />
          </div>
        );
      }
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }: { column: Column<Product, unknown> }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <div className='max-w-55'>
          <Link
            href={`/dashboard/product/${row.original.slug}`}
            className='truncate font-medium hover:underline'
          >
            {row.original.name}
          </Link>
          <p className='text-muted-foreground truncate text-xs'>{row.original.slug}</p>
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
      cell: ({ row }) => <span className='text-sm'>{row.original.category_name ?? '—'}</span>,
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
      cell: ({ row }) => formatProductPrice(row.original.price)
    },
    {
      id: 'status',
      accessorKey: 'status',
      enableSorting: false,
      header: ({ column }: { column: Column<Product, unknown> }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline' className='capitalize'>
          {row.original.status}
        </Badge>
      )
    },
    {
      id: 'stock',
      accessorFn: (row) => sumVariantStock(row.variants),
      enableSorting: false,
      header: 'Stock',
      cell: ({ row }) => sumVariantStock(row.original.variants)
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: ({ column }: { column: Column<Product, unknown> }) => (
        <DataTableColumnHeader column={column} title='Created' />
      ),
      cell: ({ row }) => formatProductDate(row.original.created_at)
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} />
    }
  ];
}
