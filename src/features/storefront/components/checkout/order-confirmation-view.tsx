'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { buttonVariants } from '@/components/ui/button';
import { shippingAreaLabel } from '@/features/orders/constants';
import type { PlaceCodOrderResult } from '@/features/orders/types';
import { formatMoney } from '@/lib/format-money';
import { cn } from '@/lib/utils';

import { CONFIRMATION_KEY } from './checkout-view';

export function OrderConfirmationView() {
  const searchParams = useSearchParams();
  const orderFromQuery = searchParams.get('order');
  const [order, setOrder] = useState<PlaceCodOrderResult | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CONFIRMATION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PlaceCodOrderResult;
      if (!orderFromQuery || parsed.order_number === orderFromQuery) {
        setOrder(parsed);
      }
    } catch {
      // ignore
    }
  }, [orderFromQuery]);

  const orderNumber = order?.order_number ?? orderFromQuery;

  return (
    <div className='mx-auto max-w-xl px-6 py-16 sm:px-10'>
      <h1 className='font-serif text-3xl'>Order Confirmed</h1>
      <p className='text-muted-foreground mt-3 text-sm'>Thank you for your order.</p>

      <div className='border-border mt-8 space-y-3 border p-6 text-sm'>
        <div className='flex justify-between gap-4'>
          <span className='text-muted-foreground'>Order Number</span>
          <span className='font-medium'>{orderNumber ?? '—'}</span>
        </div>
        {order ? (
          <>
            <div className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>Phone</span>
              <span>{order.customer_phone}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>Shipping</span>
              <span className='text-right'>{shippingAreaLabel(order.shipping_area)}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>Payment</span>
              <span>Cash on Delivery</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>Total</span>
              <span className='font-medium'>{formatMoney(order.total, order.currency)}</span>
            </div>
          </>
        ) : (
          <div className='flex justify-between gap-4'>
            <span className='text-muted-foreground'>Payment</span>
            <span>Cash on Delivery</span>
          </div>
        )}
      </div>

      <div className='mt-10 flex flex-wrap gap-3'>
        <Link
          href='/shop'
          className={cn(buttonVariants(), 'cursor-pointer rounded-none uppercase')}
        >
          Continue Shopping
        </Link>
        <Link
          href='/cart'
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'cursor-pointer rounded-none uppercase'
          )}
        >
          View Cart
        </Link>
      </div>
    </div>
  );
}
