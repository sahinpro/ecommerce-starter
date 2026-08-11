'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { useCartStore } from '../../utils/cart-store';
import { formatPrice } from '../../utils/format-price';

export function CheckoutView() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shipping = subtotal > 0 ? 200 : 0;
  const total = subtotal + shipping;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    clearCart();
    toast.success('Order placed successfully (mock)');
    setIsSubmitting(false);
  }

  if (items.length === 0) {
    return (
      <div className='mx-auto max-w-2xl px-10 py-24 text-center'>
        <h1 className='font-serif text-3xl'>Nothing to checkout</h1>
        <Link
          href='/shop'
          className={cn(buttonVariants(), 'mt-8 inline-flex rounded-none uppercase')}
        >
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <div className='mx-auto grid max-w-6xl gap-12 px-10 py-12 lg:grid-cols-[1fr_360px]'>
      <form onSubmit={handleSubmit} className='space-y-8'>
        <div>
          <h1 className='font-serif text-3xl'>Checkout</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            Mock checkout — Supabase orders will connect in the next phase.
          </p>
        </div>

        <section className='space-y-4'>
          <h2 className='text-sm tracking-[0.15em] uppercase'>Contact</h2>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='firstName'>First name</Label>
              <Input id='firstName' required className='rounded-none' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='lastName'>Last name</Label>
              <Input id='lastName' required className='rounded-none' />
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' required className='rounded-none' />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone</Label>
            <Input id='phone' required className='rounded-none' />
          </div>
        </section>

        <section className='space-y-4'>
          <h2 className='text-sm tracking-[0.15em] uppercase'>Shipping address</h2>
          <div className='space-y-2'>
            <Label htmlFor='address'>Address</Label>
            <Input id='address' required className='rounded-none' />
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='city'>City</Label>
              <Input id='city' required className='rounded-none' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='postal'>Postal code</Label>
              <Input id='postal' required className='rounded-none' />
            </div>
          </div>
        </section>

        <Button
          type='submit'
          isLoading={isSubmitting}
          className='h-12 w-full rounded-none uppercase sm:w-auto sm:px-12'
        >
          Place order
        </Button>
      </form>

      <aside className='border-border h-fit border p-6'>
        <h2 className='mb-4 text-sm tracking-[0.15em] uppercase'>Order summary</h2>
        <ul className='space-y-3 text-sm'>
          {items.map((item) => (
            <li key={item.id} className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className='border-border mt-6 space-y-2 border-t pt-4 text-sm'>
          <div className='flex justify-between'>
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className='flex justify-between'>
            <span>Shipping</span>
            <span>{formatPrice(shipping)}</span>
          </div>
          <div className='flex justify-between font-medium'>
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
