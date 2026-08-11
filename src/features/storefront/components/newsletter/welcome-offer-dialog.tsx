'use client';

import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

export function WelcomeOfferDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='max-w-[450px] rounded-none border-black/10 p-8'>
        <button
          type='button'
          onClick={() => setOpen(false)}
          className='absolute top-4 right-4 opacity-60 hover:opacity-100'
          aria-label='Close'
        >
          <Icons.close className='size-4' />
        </button>

        <DialogHeader className='items-center space-y-0 text-center'>
          <DialogTitle className='space-y-4 font-normal'>
            <p className='text-xs tracking-[0.2em] uppercase'>Welcome Offer</p>
            <p className='font-serif text-4xl'>10% Off</p>
            <p className='text-xs tracking-[0.2em] uppercase'>Your First Order</p>
          </DialogTitle>
        </DialogHeader>

        <p className='text-muted-foreground mt-6 text-center text-sm leading-relaxed'>
          Join our community and be among the first to discover new arrivals,
          styling guidance, and the care knowledge that makes every piece last
          a lifetime.
        </p>

        <form className='mt-6 space-y-3' onSubmit={(e) => e.preventDefault()}>
          <Input placeholder='Email Address*' className='h-12 rounded-none' />
          <Input placeholder='First Name*' className='h-12 rounded-none' />
          <Button type='submit' className='h-[54px] w-full rounded-none uppercase'>
            Claim offer
          </Button>
        </form>

        <button
          type='button'
          onClick={() => setOpen(false)}
          className='text-muted-foreground mx-auto mt-4 block text-xs underline-offset-4 hover:underline'
        >
          No, thanks
        </button>
      </DialogContent>
    </Dialog>
  );
}
