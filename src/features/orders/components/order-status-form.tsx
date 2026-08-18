'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { updateOrderStatusAction } from '../actions';
import { ORDER_STATUSES } from '../constants';

type OrderStatusFormProps = {
  orderId: string;
  currentStatus: string;
};

export function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (status === currentStatus) {
      toast.warning('No changes', {
        description: 'Select a different status before updating.'
      });
      return;
    }

    if (status === 'cancelled') {
      toast.warning('Cancelling order', {
        description: 'Stock will be restored for this order.'
      });
    }

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, status);
      if (!result.ok) {
        toast.error('Could not update order', {
          description: result.error
        });
        return;
      }
      toast.success(
        result.data.order_status === 'cancelled'
          ? 'Order cancelled — stock restored'
          : 'Order status updated',
        {
          description:
            result.data.order_status === 'delivered'
              ? 'COD payment marked as paid.'
              : `Status is now ${result.data.order_status}.`
        }
      );
      router.refresh();
    });
  }

  return (
    <div className='flex min-w-0 flex-col gap-3'>
      <div className='min-w-0 space-y-2'>
        <Label htmlFor='order-status'>Order status</Label>
        <Select
          items={ORDER_STATUSES.map((value) => ({
            value,
            label: value
          }))}
          value={status}
          onValueChange={(value) => setStatus(value ?? currentStatus)}
        >
          <SelectTrigger id='order-status' className='h-9 w-full min-w-0 cursor-pointer capitalize'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((value) => (
              <SelectItem key={value} value={value} className='cursor-pointer capitalize'>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type='button'
        className='w-full shrink-0 cursor-pointer'
        isLoading={isPending}
        onClick={handleSave}
        disabled={status === currentStatus}
      >
        Update status
      </Button>
    </div>
  );
}
