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
    <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
      <div className='space-y-2 sm:min-w-55'>
        <Label>Order status</Label>
        <Select
          items={ORDER_STATUSES.map((value) => ({
            value,
            label: value
          }))}
          value={status}
          onValueChange={(value) => setStatus(value ?? currentStatus)}
        >
          <SelectTrigger className='w-full cursor-pointer capitalize'>
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
        className='cursor-pointer'
        isLoading={isPending}
        onClick={handleSave}
        disabled={status === currentStatus}
      >
        Update status
      </Button>
    </div>
  );
}
