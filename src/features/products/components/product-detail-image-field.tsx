'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MediaPickerDialog } from '@/features/media';

type ProductDetailImageFieldProps = {
  label: string;
  imageUrl: string;
  onChange: (next: { id: string; url: string } | null) => void;
};

export function ProductDetailImageField({
  label,
  imageUrl,
  onChange
}: ProductDetailImageFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className='space-y-2'>
      <Label className='text-xs'>{label}</Label>
      {imageUrl ? (
        <div className='flex items-start gap-2'>
          <div className='relative size-20 overflow-hidden rounded-md border'>
            <Image src={imageUrl} alt={label} fill className='object-cover' sizes='80px' />
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-8 cursor-pointer'
            aria-label={`Remove ${label}`}
            onClick={() => onChange(null)}
          >
            <Icons.trash className='size-4' />
          </Button>
        </div>
      ) : (
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='cursor-pointer'
          onClick={() => setPickerOpen(true)}
        >
          <Icons.media className='size-3.5' />
          Add image
        </Button>
      )}
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        multiple={false}
        onSelect={(assets) => {
          const asset = assets[0];
          if (!asset) return;
          onChange({ id: asset.id, url: asset.url });
        }}
      />
    </div>
  );
}
