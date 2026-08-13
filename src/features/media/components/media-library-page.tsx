'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { uploadOrReuseMedia } from '../api/client';
import { deleteMediaMutation, mediaAssetsQueryOptions, mediaKeys } from '../api/queries';
import type { MediaAsset } from '../api/types';
import { getQueryClient } from '@/lib/query-client';

function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function MediaLibraryPage() {
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<MediaAsset | null>(null);

  const {
    data: assets = [],
    isLoading,
    isFetching
  } = useQuery(mediaAssetsQueryOptions({ search }));

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadOrReuseMedia(file, 'products'),
    onSuccess: (result) => {
      void getQueryClient().invalidateQueries({ queryKey: mediaKeys.all });
      toast.success(
        result.reused ? 'Duplicate file — reusing library image' : 'Saved to media library'
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    }
  });

  const removeMutation = useMutation({
    ...deleteMediaMutation,
    onSuccess: () => {
      toast.success('Media deleted');
      setPendingDelete(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not delete media');
    }
  });

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search media…'
          className='max-w-sm'
        />
        <label className='inline-flex cursor-pointer'>
          <span
            className={cn(
              'bg-primary text-primary-foreground inline-flex h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-sm shadow-xs',
              uploadMutation.isPending && 'pointer-events-none opacity-50'
            )}
          >
            <Icons.upload className='size-4' />
            {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
          </span>
          <input
            type='file'
            accept='image/jpeg,image/png,image/webp'
            className='sr-only'
            disabled={uploadMutation.isPending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) uploadMutation.mutate(file);
            }}
          />
        </label>
        {isFetching ? <span className='text-muted-foreground text-xs'>Refreshing…</span> : null}
      </div>

      {isLoading ? (
        <p className='text-muted-foreground text-sm'>Loading media library…</p>
      ) : assets.length === 0 ? (
        <p className='text-muted-foreground text-sm'>
          No media yet. Upload images here, then attach them to products.
        </p>
      ) : (
        <ul className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
          {assets.map((asset) => (
            <li key={asset.id} className='overflow-hidden rounded-md border'>
              <div className='bg-muted relative aspect-square'>
                <Image
                  src={asset.url}
                  alt={asset.alt || asset.public_id}
                  fill
                  className='object-cover'
                  sizes='200px'
                />
              </div>
              <div className='space-y-2 p-3'>
                <p className='truncate font-mono text-xs' title={asset.public_id}>
                  {asset.public_id}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {asset.width && asset.height ? `${asset.width}×${asset.height} · ` : null}
                  {formatBytes(asset.bytes)}
                  {typeof asset.usage_count === 'number'
                    ? ` · ${asset.usage_count} product${asset.usage_count === 1 ? '' : 's'}`
                    : null}
                </p>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    className='flex-1 cursor-pointer'
                    onClick={() => window.open(asset.url, '_blank', 'noopener,noreferrer')}
                  >
                    View
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    variant='ghost'
                    className='cursor-pointer'
                    disabled={(asset.usage_count ?? 0) > 0}
                    title={
                      (asset.usage_count ?? 0) > 0
                        ? 'Remove from products first'
                        : 'Delete from library'
                    }
                    onClick={() => setPendingDelete(asset)}
                  >
                    <Icons.trash className='size-4' />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AlertModal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) removeMutation.mutate(pendingDelete.id);
        }}
        loading={removeMutation.isPending}
      />
    </div>
  );
}
