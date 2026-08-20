'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { placeCodOrderAction } from '@/features/orders/actions';
import { SHIPPING_AREAS, shippingFeeForArea, type ShippingArea } from '@/features/orders/constants';
import { formatMoney } from '@/lib/format-money';
import { cn } from '@/lib/utils';

import { useCartStore } from '../../utils/cart-store';

const CONFIRMATION_KEY = 'sukoon-order-confirmation';

export function CheckoutView() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [shippingArea, setShippingArea] = useState<ShippingArea | ''>('');

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  // Display estimate only — server recalculates shipping from shipping_area.
  const estimatedShipping = shippingArea === '' ? null : shippingFeeForArea(shippingArea);
  const estimatedTotal = estimatedShipping == null ? null : subtotal + estimatedShipping;

  const canSubmit =
    customerName.trim().length >= 2 &&
    phone.trim().length >= 10 &&
    address.trim().length >= 5 &&
    shippingArea !== '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      toast.warning('Complete required fields', {
        description: 'Full name, phone, address, and shipping area are required.'
      });
      return;
    }

    const selectedArea = shippingArea as ShippingArea;

    startTransition(async () => {
      const result = await placeCodOrderAction({
        customer_name: customerName,
        customer_phone: phone,
        address,
        shipping_area: selectedArea,
        items: items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity
        }))
      });

      if (!result.ok) {
        setError(result.error);
        const isStock = /sold out|only \d+ items are available|out of stock|insufficient/i.test(
          result.error
        );
        if (isStock) {
          toast.warning('Not enough stock', {
            description: result.error
          });
        } else {
          toast.error('Checkout failed', {
            description: result.error
          });
        }
        return;
      }

      try {
        sessionStorage.setItem(CONFIRMATION_KEY, JSON.stringify(result.data));
      } catch {
        // ignore storage failures
      }

      clearCart();
      toast.success('Order placed successfully', {
        description: `Order ${result.data.order_number} · Cash on Delivery`
      });
      router.push(`/checkout/confirmation?order=${encodeURIComponent(result.data.order_number)}`);
    });
  }

  if (items.length === 0) {
    return (
      <div className='mx-auto max-w-2xl px-6 py-24 text-center sm:px-10'>
        <h1 className='font-serif text-3xl'>Nothing to checkout</h1>
        <Link
          href='/shop'
          className={cn(buttonVariants(), 'mt-8 inline-flex cursor-pointer rounded-none uppercase')}
        >
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <div className='mx-auto grid max-w-6xl gap-12 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_360px]'>
      <form onSubmit={handleSubmit} className='space-y-8'>
        <div>
          <h1 className='font-serif text-3xl'>Checkout</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            Cash on Delivery — we will contact you by phone.
          </p>
        </div>

        <section className='space-y-4'>
          <h2 className='text-sm tracking-[0.15em] uppercase'>Customer Information</h2>
          <div className='space-y-2'>
            <Label htmlFor='fullName'>Full Name *</Label>
            <Input
              id='fullName'
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className='rounded-none'
              autoComplete='name'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone Number *</Label>
            <Input
              id='phone'
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className='rounded-none'
              placeholder='01XXXXXXXXX'
              autoComplete='tel'
              inputMode='tel'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='address'>Address *</Label>
            <Textarea
              id='address'
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className='min-h-24 rounded-none'
              autoComplete='street-address'
              placeholder='House, road, area…'
            />
          </div>
        </section>

        <section className='border-border space-y-3 border p-4'>
          <h2 className='text-sm tracking-[0.15em] uppercase'>Shipping</h2>
          <p className='text-sm font-medium'>Shipping Area *</p>
          <div className='space-y-3'>
            {SHIPPING_AREAS.map((area) => {
              const inputId = `shipping-area-${area.value}`;
              return (
                <div key={area.value} className='flex items-start gap-3'>
                  <input
                    id={inputId}
                    type='radio'
                    name='shipping_area'
                    required
                    checked={shippingArea === area.value}
                    onChange={() => setShippingArea(area.value)}
                    className='mt-1 cursor-pointer'
                  />
                  <label htmlFor={inputId} className='cursor-pointer font-medium'>
                    {area.label} — {formatMoney(area.fee)}
                  </label>
                </div>
              );
            })}
          </div>
        </section>

        <section className='border-border space-y-3 border p-4'>
          <h2 className='text-sm tracking-[0.15em] uppercase'>Payment</h2>
          <div className='flex items-start gap-3'>
            <input
              id='payment-cod'
              type='radio'
              name='payment'
              checked
              readOnly
              className='mt-1 cursor-pointer'
            />
            <label htmlFor='payment-cod' className='cursor-pointer'>
              <span className='font-medium'>Cash on Delivery</span>
              <span className='text-muted-foreground mt-1 block text-sm'>
                Pay in cash when your order is delivered.
              </span>
            </label>
          </div>
        </section>

        {error ? <p className='text-destructive text-sm'>{error}</p> : null}

        <Button
          type='submit'
          isLoading={isPending}
          disabled={!canSubmit}
          className='h-12 w-full cursor-pointer rounded-none uppercase sm:w-auto sm:px-12'
        >
          Place Order
        </Button>
      </form>

      <aside className='border-border h-fit border p-6'>
        <h2 className='mb-4 text-sm tracking-[0.15em] uppercase'>Order Summary</h2>
        <ul className='space-y-3 text-sm'>
          {items.map((item) => (
            <li key={item.id} className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>
                {item.name} ({item.size}
                {item.color ? ` / ${item.color}` : ''}) × {item.quantity}
              </span>
              <span>{formatMoney(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className='border-border mt-6 space-y-2 border-t pt-4 text-sm'>
          <div className='flex justify-between'>
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className='flex justify-between'>
            <span>Shipping Fee</span>
            <span>
              {estimatedShipping == null ? 'Select area' : formatMoney(estimatedShipping)}
            </span>
          </div>
          <div className='flex justify-between font-medium'>
            <span>Total</span>
            <span>{estimatedTotal == null ? '—' : formatMoney(estimatedTotal)}</span>
          </div>
          <p className='text-muted-foreground pt-2 text-xs'>
            Final shipping and total are confirmed on the server.
          </p>
        </div>
      </aside>
    </div>
  );
}

export { CONFIRMATION_KEY };
