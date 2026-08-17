'use client';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

import { STORE_ANNOUNCEMENT } from '../../constants/mock-data';

type AnnouncementBarProps = {
  visible?: boolean;
  onDismiss?: () => void;
};

export function AnnouncementBar({ visible = true, onDismiss }: AnnouncementBarProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'relative flex h-10 w-full shrink-0 items-center justify-center overflow-hidden px-4',
        'bg-white text-black md:px-10'
      )}
      data-node-id='1:216'
    >
      <p className='px-8 text-center text-[13px] leading-3 tracking-[0.28px] md:px-0 md:text-[13.8px]'>
        {STORE_ANNOUNCEMENT}
      </p>
      <button
        type='button'
        onClick={() => onDismiss?.()}
        className='absolute top-[20%] right-4 bottom-[20%] flex w-6 items-center justify-center opacity-90 transition-opacity hover:opacity-100 md:right-5'
        aria-label='Dismiss announcement'
      >
        <Icons.close className='size-[13.5px]' />
      </button>
    </div>
  );
}
