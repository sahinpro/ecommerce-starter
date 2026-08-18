'use client';

import { useState } from 'react';
import Image from 'next/image';

import { PRODUCT_IMAGE_FALLBACK } from '@/features/storefront/constants/product-image';

export function TableImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  const url = src?.trim() && !failed ? src : PRODUCT_IMAGE_FALLBACK;

  return (
    <div className='relative size-10 overflow-hidden rounded-md border'>
      <Image
        src={url}
        alt={alt}
        fill
        sizes='40px'
        className='object-cover'
        onError={() => {
          if (url !== PRODUCT_IMAGE_FALLBACK) setFailed(true);
        }}
      />
    </div>
  );
}
