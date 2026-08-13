import { Suspense } from 'react';
import type { Metadata } from 'next';

import { OrderConfirmationView } from '@/features/storefront/components/checkout/order-confirmation-view';

export const metadata: Metadata = {
  title: 'Order Confirmed | Sukoon',
  robots: { index: false, follow: false }
};

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className='px-10 py-16 text-sm'>Loading confirmation…</div>}>
      <OrderConfirmationView />
    </Suspense>
  );
}
