'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';

import { deleteOrdersAction } from '../actions';

type OrderDeleteButtonProps = {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
};

export function OrderDeleteButton({ orderId, orderNumber, orderStatus }: OrderDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const leftWarehouse = orderStatus === 'shipped' || orderStatus === 'delivered';

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteOrdersAction([orderId]);
      if (!result.ok) {
        toast.error('Could not delete order', { description: result.error });
        return;
      }
      toast.success('Order deleted');
      setOpen(false);
      router.push('/dashboard/orders');
      router.refresh();
    });
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => {
          if (!isPending) setOpen(false);
        }}
        onConfirm={handleConfirm}
        loading={isPending}
        title={`Delete order ${orderNumber}?`}
        description={
          leftWarehouse
            ? 'This order already left inventory, so stock will not be restored. This cannot be undone.'
            : 'Stock will be restored if it is still held, then this order will be permanently deleted. This cannot be undone.'
        }
        confirmLabel='Delete'
      />
      <Button
        type='button'
        variant='outline'
        className='text-destructive w-full cursor-pointer'
        onClick={() => setOpen(true)}
      >
        <Icons.trash className='size-4' />
        Delete order
      </Button>
    </>
  );
}
