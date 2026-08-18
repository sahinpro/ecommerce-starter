'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { SHIPPING_AREAS } from '@/features/orders/constants';

import { updateStoreSettingsAction } from '../actions';
import { storeSettingsSchema, type StoreSettingsFormValues } from '../schemas/settings';
import type { StoreSettings } from '../types';

export function StoreSettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      shipping_cost: settings.shipping_cost,
      free_shipping_threshold: settings.free_shipping_threshold,
      low_stock_threshold: settings.low_stock_threshold
    } as StoreSettingsFormValues,
    validators: {
      onSubmit: storeSettingsSchema
    },
    onSubmit: async ({ value }) => {
      const thresholdRaw = value.free_shipping_threshold;
      const result = await updateStoreSettingsAction({
        shipping_cost: Number(value.shipping_cost),
        free_shipping_threshold:
          thresholdRaw === '' || thresholdRaw == null || Number.isNaN(Number(thresholdRaw))
            ? null
            : Number(thresholdRaw),
        low_stock_threshold: Number(value.low_stock_threshold)
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Store settings saved');
      router.refresh();
    }
  });

  const { FormTextField } = useFormFields<StoreSettingsFormValues>();

  return (
    <div className='grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]'>
      <form.AppForm>
        <form.Form className='flex flex-col gap-4 p-0'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base font-medium'>Inventory</CardTitle>
              <CardDescription>
                Used for dashboard low-stock alerts. Checkout stock still follows on-hand variant
                quantity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormTextField
                name='low_stock_threshold'
                label='Low-stock threshold'
                type='number'
                min={0}
                step={1}
                required
                description='Variants at or below this quantity are flagged as low stock.'
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base font-medium'>Shipping</CardTitle>
              <CardDescription>
                Fallback shipping cost stored in the database. Live checkout COD fees currently
                follow the Dhaka zones below until the order RPC is pointed at these settings.
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-5'>
              <FormTextField
                name='shipping_cost'
                label='Default shipping cost (BDT)'
                type='number'
                min={0}
                step={1}
                required
              />
              <FormTextField
                name='free_shipping_threshold'
                label='Free shipping threshold (BDT)'
                type='number'
                min={0}
                step={1}
                description='Leave empty to disable. Not applied at checkout yet.'
              />
            </CardContent>
          </Card>

          <div className='flex justify-end'>
            <form.SubmitButton>Save settings</form.SubmitButton>
          </div>
        </form.Form>
      </form.AppForm>

      <aside className='flex flex-col gap-4 lg:sticky lg:top-16'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base font-medium'>Checkout fees</CardTitle>
            <CardDescription>Cash on Delivery zones used on the storefront today.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-2 text-sm'>
            {SHIPPING_AREAS.map((area) => (
              <div key={area.value} className='flex justify-between gap-3'>
                <span>{area.label}</span>
                <span className='tabular-nums'>৳{area.fee}</span>
              </div>
            ))}
            <p className='text-muted-foreground pt-2 text-xs'>Currency: BDT (not editable)</p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
