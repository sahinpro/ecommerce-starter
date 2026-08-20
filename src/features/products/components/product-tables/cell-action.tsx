'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import {
  archiveProductMutation,
  catalogRevalidate,
  deleteProductMutation,
  restoreProductMutation
} from '../../api/mutations';
import type { Product } from '../../api/types';

interface CellActionProps {
  data: Product;
}

type ConfirmKind = 'archive' | 'delete';

const CONFIRM_COPY: Record<
  ConfirmKind,
  { title: string; description: string; confirmLabel: string }
> = {
  archive: {
    title: 'Archive this product?',
    description: 'Archived products are hidden from the storefront. You can restore them anytime.',
    confirmLabel: 'Archive'
  },
  delete: {
    title: 'Delete this product?',
    description: 'This action cannot be undone.',
    confirmLabel: 'Delete'
  }
};

export function CellAction({ data }: CellActionProps) {
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);
  const router = useRouter();
  const archived = data.status === 'archived';

  const archiveMutation = useMutation({
    ...archiveProductMutation,
    onSuccess: () => {
      toast.success('Product archived');
      setConfirm(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to archive product');
    }
  });

  const restoreMutation = useMutation({
    ...restoreProductMutation,
    onSuccess: () => {
      toast.success('Product restored as draft');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to restore product');
    }
  });

  const deleteMutation = useMutation({
    ...deleteProductMutation,
    onSuccess: () => {
      toast.success('Product deleted');
      setConfirm(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
    }
  });

  const pending = archiveMutation.isPending || deleteMutation.isPending;
  const copy = confirm ? CONFIRM_COPY[confirm] : null;

  return (
    <>
      <AlertModal
        isOpen={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm === 'archive')
            archiveMutation.mutate({ id: data.id, ...catalogRevalidate(data) });
          if (confirm === 'delete')
            deleteMutation.mutate({ id: data.id, ...catalogRevalidate(data) });
        }}
        loading={pending}
        title={copy?.title}
        description={copy?.description}
        confirmLabel={copy?.confirmLabel}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
          <span className='sr-only'>Open menu</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push(`/dashboard/product/${data.slug}`)}>
            <Icons.edit className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          {archived ? (
            <>
              <DropdownMenuItem
                disabled={restoreMutation.isPending}
                onClick={() => restoreMutation.mutate({ id: data.id, ...catalogRevalidate(data) })}
              >
                <Icons.restore className='mr-2 h-4 w-4' /> Restore
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirm('delete')}>
                <Icons.trash className='mr-2 h-4 w-4' /> Delete
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => setConfirm('archive')}>
              <Icons.archive className='mr-2 h-4 w-4' /> Archive
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
