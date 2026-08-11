'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';

type WishlistDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WishlistDrawer({ open, onOpenChange }: WishlistDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full max-w-[400px] rounded-none p-0'>
        <SheetHeader className='border-border border-b px-5 py-8'>
          <SheetTitle className='flex items-center gap-2 text-base font-normal'>
            <Icons.heart className='size-4' />
            My Wishlist
          </SheetTitle>
        </SheetHeader>

        <div className='flex flex-col items-center px-5 py-10 text-center'>
          <Icons.heart className='text-muted-foreground mb-6 size-14 stroke-1' />
          <p className='text-sm font-medium'>Save things as you browse</p>
          <p className='text-muted-foreground mt-2 max-w-xs text-sm'>
            Tap ♡ on any product. It lands here so you don&apos;t lose it.
          </p>

          <div className='bg-muted mt-8 w-full p-4 text-left text-sm'>
            <p>Saves stay through this session.</p>
            <p className='mt-1 font-medium'>Log in to keep them permanently.</p>
          </div>

          <Button className='mt-6 h-10 w-full rounded-none' variant='outline'>
            Log in to save permanently
          </Button>
          <Button
            className='mt-3 h-10 w-full rounded-none'
            onClick={() => onOpenChange(false)}
          >
            Keep browsing first
          </Button>
          <p className='text-muted-foreground mt-4 text-xs'>
            No account? Sign up — it takes a minute
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
