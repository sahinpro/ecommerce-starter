'use client';

import Image from 'next/image';
import * as React from 'react';
import { toast } from 'sonner';

import { FileUploader } from '@/components/file-uploader';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { CLOUDINARY_ACCEPT, CLOUDINARY_MAX_FILE_BYTES } from '@/lib/cloudinary/constants';
import type { MediaFolderKey } from '@/lib/cloudinary/folders';
import type { CloudinaryAsset } from '@/lib/cloudinary/types';
import { cn } from '@/lib/utils';

import { deleteCloudinaryImage, uploadImageToCloudinary } from '../api/upload-client';

export type CloudinaryImageUploadProps = {
  folderKey?: MediaFolderKey;
  value?: CloudinaryAsset | null;
  onChange?: (asset: CloudinaryAsset | null) => void;
  disabled?: boolean;
  className?: string;
  /** When true, deleting the preview also destroys the Cloudinary asset. */
  deleteOnRemove?: boolean;
};

/**
 * Reusable dashboard media uploader (signed Cloudinary upload).
 * Not wired into navigation — ready for Phase 5 product/category forms.
 */
export function CloudinaryImageUpload({
  folderKey = 'general',
  value = null,
  onChange,
  disabled = false,
  className,
  deleteOnRemove = false
}: CloudinaryImageUploadProps) {
  const [asset, setAsset] = React.useState<CloudinaryAsset | null>(value);
  const [progress, setProgress] = React.useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    setAsset(value ?? null);
  }, [value]);

  const handleUpload = React.useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setIsUploading(true);
      setProgress({ [file.name]: 20 });

      try {
        setProgress({ [file.name]: 60 });
        const uploaded = await uploadImageToCloudinary(file, folderKey);
        setProgress({ [file.name]: 100 });
        setAsset(uploaded);
        onChange?.(uploaded);
        toast.success('Image uploaded');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        toast.error(message);
        throw error;
      } finally {
        setIsUploading(false);
        setProgress({});
      }
    },
    [folderKey, onChange]
  );

  const handleRemove = React.useCallback(async () => {
    if (!asset) return;

    try {
      if (deleteOnRemove && asset.publicId) {
        await deleteCloudinaryImage(asset.publicId);
      }
      setAsset(null);
      onChange?.(null);
      toast.success('Image removed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove image';
      toast.error(message);
    }
  }, [asset, deleteOnRemove, onChange]);

  return (
    <div className={cn('space-y-4', className)}>
      {asset ? (
        <div className='bg-card flex items-start gap-4 rounded-lg border p-4'>
          <div className='relative size-24 overflow-hidden rounded-md border'>
            <Image
              src={asset.secureUrl}
              alt={asset.originalFilename || 'Uploaded media'}
              fill
              className='object-cover'
              sizes='96px'
              unoptimized={false}
            />
          </div>
          <div className='min-w-0 flex-1 space-y-1'>
            <p className='truncate text-sm font-medium'>
              {asset.originalFilename || asset.publicId}
            </p>
            <p className='text-muted-foreground text-xs'>
              {asset.width}×{asset.height} · {asset.format.toUpperCase()} ·{' '}
              {Math.round(asset.bytes / 1024)} KB
            </p>
            <p className='text-muted-foreground truncate font-mono text-[11px]'>{asset.publicId}</p>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-8'
            disabled={disabled || isUploading}
            onClick={() => {
              void handleRemove();
            }}
            aria-label='Remove image'
          >
            <Icons.close className='size-4' />
          </Button>
        </div>
      ) : (
        <FileUploader
          accept={CLOUDINARY_ACCEPT}
          maxSize={CLOUDINARY_MAX_FILE_BYTES}
          maxFiles={1}
          multiple={false}
          disabled={disabled || isUploading}
          progresses={progress}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
}
