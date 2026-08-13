'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

type OrdersLoadErrorProps = {
  message: string;
};

function isMissingSchemaError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('does not exist') ||
    lower.includes('order_number') ||
    lower.includes('store_settings') ||
    lower.includes('place_cod_order')
  );
}

export function OrdersLoadError({ message }: OrdersLoadErrorProps) {
  const schemaMissing = isMissingSchemaError(message);

  useEffect(() => {
    if (schemaMissing) {
      toast.warning('Orders migration required', {
        description:
          'Run supabase/migrations/20260813120000_cod_orders_inventory.sql in the Supabase SQL Editor, then refresh.'
      });
      return;
    }

    toast.error('Could not load orders', {
      description: message
    });
  }, [message, schemaMissing]);

  return (
    <div className='rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 p-6 text-sm'>
      <p className='font-medium'>
        {schemaMissing ? 'Database migration not applied yet' : 'Failed to load orders'}
      </p>
      <p className='text-muted-foreground mt-2'>
        {schemaMissing ? (
          <>
            Open Supabase → SQL Editor and run{' '}
            <code className='bg-muted rounded px-1 py-0.5 text-xs'>
              supabase/migrations/20260813120000_cod_orders_inventory.sql
            </code>
            , then refresh this page.
          </>
        ) : (
          message
        )}
      </p>
    </div>
  );
}
