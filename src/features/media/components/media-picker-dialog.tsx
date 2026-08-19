'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { uploadOrReuseMedia } from '../api/client';
import { mediaAssetsQueryOptions, mediaKeys } from '../api/queries';
import type { MediaAsset } from '../api/types';
import { getQueryClient } from '@/lib/query-client';

type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (assets: MediaAsset[]) => void;
  excludePublicIds?: string[];
  multiple?: boolean;
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  excludePublicIds = [],
  multiple = true
}: MediaPickerDialogProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: allAssets = [], isLoading } = useQuery({
    ...mediaAssetsQueryOptions({ search }),
    enabled: open
  });
  const assets = useMemo(() => allAssets.filter((asset) => !asset.locked), [allAssets]);

  const excluded = useMemo(() => new Set(excludePublicIds), [excludePublicIds]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadOrReuseMedia(file, 'products'),
    onSuccess: (result) => {
      void getQueryClient().invalidateQueries({ queryKey: mediaKeys.all });
      setSelected((prev) => new Set(prev).add(result.asset.id));
      toast.success(
        result.reused ? 'Duplicate file — reusing library image' : 'Image uploaded to library'
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    }
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  function handleConfirm() {
    const picked = assets.filter((asset) => selected.has(asset.id));
    if (!picked.length) {
      toast.error('Select at least one image');
      return;
    }
    onSelect(picked);
    setSelected(new Set());
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelected(new Set());
        onOpenChange(next);
      }}
    >
      <DialogContent className='flex max-h-[85vh] max-w-3xl flex-col gap-4 overflow-hidden sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
        </DialogHeader>

        <div className='flex flex-wrap items-center gap-2'>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Search by name or public id…'
            className='max-w-sm'
          />
          <label className='inline-flex cursor-pointer'>
            <span
              className={cn(
                'border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm shadow-xs',
                uploadMutation.isPending && 'pointer-events-none opacity-50'
              )}
            >
              <Icons.upload className='size-4' />
              {uploadMutation.isPending ? 'Uploading…' : 'Upload new'}
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
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto rounded-md border p-3'>
          {isLoading ? (
            <p className='text-muted-foreground text-sm'>Loading media…</p>
          ) : assets.length === 0 ? (
            <p className='text-muted-foreground text-sm'>No media yet. Upload an image.</p>
          ) : (
            <ul className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
              {assets.map((asset) => {
                const alreadyOnProduct = excluded.has(asset.public_id);
                const isSelected = selected.has(asset.id);
                return (
                  <li key={asset.id}>
                    <button
                      type='button'
                      disabled={alreadyOnProduct}
                      onClick={() => toggle(asset.id)}
                      className={cn(
                        'relative aspect-square w-full cursor-pointer overflow-hidden rounded-md border transition',
                        isSelected && 'ring-primary ring-2',
                        alreadyOnProduct && 'cursor-not-allowed opacity-40'
                      )}
                    >
                      <Image
                        src={asset.url}
                        alt={asset.alt || asset.public_id}
                        fill
                        className='object-cover'
                        sizes='160px'
                      />
                      {alreadyOnProduct ? (
                        <span className='bg-background/80 absolute inset-x-0 bottom-0 px-1 py-0.5 text-[10px]'>
                          On product
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='button' onClick={handleConfirm} disabled={selected.size === 0}>
            Add {selected.size > 0 ? `(${selected.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
