'use client';

import Image from 'next/image';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useCartStore } from '../../utils/cart-store';
import { formatPrice } from '../../utils/format-price';

export function CartView() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  if (items.length === 0) {
    return (
      <div className='mx-auto max-w-2xl px-10 py-24 text-center'>
        <h1 className='font-serif text-3xl'>Your cart is empty</h1>
        <p className='text-muted-foreground mt-4 text-sm'>
          Discover our latest arrivals and add something you love.
        </p>
        <Link
          href='/shop'
          className={cn(buttonVariants(), 'mt-8 rounded-none px-8 uppercase')}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-6xl px-10 py-12'>
      <h1 className='font-serif mb-10 text-3xl'>Shopping Bag</h1>

      <div className='grid gap-12 lg:grid-cols-[1fr_360px]'>
        <ul className='divide-border divide-y'>
          {items.map((item) => (
            <li key={item.id} className='flex gap-6 py-6'>
              <div className='bg-muted relative size-32 shrink-0 overflow-hidden'>
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className='object-cover' />
                ) : null}
              </div>
              <div className='flex flex-1 flex-col justify-between'>
                <div>
                  <Link
                    href={`/product/${item.slug}`}
                    className='hover:text-foreground/70 text-sm transition-colors'
                  >
                    {item.name}
                  </Link>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {item.color} · Size {item.size}
                  </p>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <button
                      type='button'
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className='border-border size-8 border text-sm'
                    >
                      −
                    </button>
                    <span className='w-6 text-center text-sm'>{item.quantity}</span>
                    <button
                      type='button'
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className='border-border size-8 border text-sm'
                    >
                      +
                    </button>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm'>{formatPrice(item.price * item.quantity)}</p>
                    <button
                      type='button'
                      onClick={() => removeItem(item.id)}
                      className='text-muted-foreground mt-1 text-xs underline-offset-2 hover:underline'
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className='border-border h-fit border p-6'>
          <div className='flex justify-between text-sm'>
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className='text-muted-foreground mt-2 text-xs'>
            Shipping and taxes calculated at checkout.
          </p>
          <Link
            href='/checkout'
            className={cn(
              buttonVariants(),
              'mt-6 inline-flex h-11 w-full items-center justify-center rounded-none uppercase'
            )}
          >
            Checkout
          </Link>
          <Link
            href='/shop'
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'mt-3 inline-flex h-11 w-full items-center justify-center rounded-none uppercase'
            )}
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
