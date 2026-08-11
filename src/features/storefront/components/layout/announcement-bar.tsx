'use client';

import { useState } from 'react';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

import { STORE_ANNOUNCEMENT } from '../../constants/mock-data';

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className='bg-primary text-primary-foreground relative flex h-10 items-center justify-center px-10 text-xs tracking-wide'>
      <p>{STORE_ANNOUNCEMENT}</p>
      <button
        type='button'
        onClick={() => setVisible(false)}
        className={cn(
          'absolute right-4 flex size-6 items-center justify-center',
          'opacity-70 transition-opacity hover:opacity-100'
        )}
        aria-label='Dismiss announcement'
      >
        <Icons.close className='size-3.5' />
      </button>
    </div>
  );
}
