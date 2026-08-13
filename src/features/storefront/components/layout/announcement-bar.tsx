'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

import { STORE_ANNOUNCEMENT } from '../../constants/mock-data';
import { StorefrontIcon } from '../brand/storefront-icon';

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'bg-sukoon-dark relative flex h-10 w-full shrink-0 items-center justify-center overflow-hidden px-10 text-white'
      )}
      data-node-id='1:216'
    >
      <p className='text-center text-[13.8px] leading-[12px] tracking-[0.28px]'>
        {STORE_ANNOUNCEMENT}
      </p>
      <button
        type='button'
        onClick={() => setVisible(false)}
        className='absolute top-[20%] right-5 bottom-[20%] flex w-6 items-center justify-center opacity-90 transition-opacity hover:opacity-100'
        aria-label='Dismiss announcement'
      >
        <StorefrontIcon name='close' className='size-[13.5px]' />
      </button>
    </div>
  );
}
