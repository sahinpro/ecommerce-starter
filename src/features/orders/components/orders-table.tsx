'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatMoney } from '@/lib/format-money';

import { deleteOrdersAction } from '../actions';
import { shippingAreaLabel } from '../constants';
import type { Order } from '../types';

type OrdersTableProps = {
  items: Order[];
};

function deleteCopy(orders: Order[]): { title: string; description: string } {
  const count = orders.length;
  const leftWarehouse = orders.some(
    (order) => order.order_status === 'shipped' || order.order_status === 'delivered'
  );
  const title =
    count === 1 ? `Delete order ${orders[0]?.order_number || ''}?` : `Delete ${count} orders?`;
  const description = leftWarehouse
    ? 'Shipped or delivered orders are removed without restoring stock. Other orders restore stock first. This cannot be undone.'
    : 'Stock will be restored for open orders, then they will be permanently deleted. This cannot be undone.';
  return { title, description };
}

export function OrdersTable({ items }: OrdersTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmIds, setConfirmIds] = useState<string[] | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const valid = new Set(items.map((order) => order.id));
    setSelectedIds((current) => current.filter((id) => valid.has(id)));
  }, [items]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;
  const confirmOrders = confirmIds ? items.filter((order) => confirmIds.includes(order.id)) : [];
  const copy = confirmOrders.length > 0 ? deleteCopy(confirmOrders) : null;

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? items.map((order) => order.id) : []);
  }

  function toggleOne(orderId: string, checked: boolean) {
    setSelectedIds((current) =>
      checked ? Array.from(new Set([...current, orderId])) : current.filter((id) => id !== orderId)
    );
  }

  function runDelete(ids: string[]) {
    startTransition(async () => {
      const result = await deleteOrdersAction(ids);
      if (!result.ok) {
        toast.error('Could not delete orders', { description: result.error });
        return;
      }
      toast.success(
        result.data.deleted === 1 ? 'Order deleted' : `${result.data.deleted} orders deleted`
      );
      setConfirmIds(null);
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
      router.refresh();
    });
  }

  return (
    <>
      <AlertModal
        isOpen={confirmIds != null && confirmOrders.length > 0}
        onClose={() => {
          if (!isPending) setConfirmIds(null);
        }}
        onConfirm={() => {
          if (confirmIds?.length) runDelete(confirmIds);
        }}
        loading={isPending}
        title={copy?.title}
        description={copy?.description}
        confirmLabel='Delete'
      />

      <div className='space-y-3'>
        {selectedIds.length > 0 ? (
          <div className='bg-card flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm'>
            <p className='font-medium'>
              {selectedIds.length} selected
              <span className='text-muted-foreground font-normal'> — choose a bulk action</span>
            </p>
            <Button
              variant='outline'
              size='sm'
              className='text-destructive'
              onClick={() => setConfirmIds(selectedIds)}
            >
              <Icons.trash />
              Delete
            </Button>
          </div>
        ) : null}

        <div className='bg-card rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10'>
                  <Checkbox
                    aria-label='Select all orders on this page'
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                  />
                </TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Shipping</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className='w-12'>
                  <span className='sr-only'>Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((order) => (
                <TableRow
                  key={order.id}
                  data-state={selectedSet.has(order.id) ? 'selected' : undefined}
                >
                  <TableCell>
                    <Checkbox
                      aria-label={`Select ${order.order_number || order.id}`}
                      checked={selectedSet.has(order.id)}
                      onCheckedChange={(checked) => toggleOne(order.id, Boolean(checked))}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className='cursor-pointer font-medium underline-offset-4 hover:underline'
                    >
                      {order.order_number || order.id.slice(0, 8)}
                    </Link>
                  </TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.customer_phone}</TableCell>
                  <TableCell className='text-xs'>
                    {shippingAreaLabel(order.shipping_area)}
                  </TableCell>
                  <TableCell>{formatMoney(order.total, order.currency)}</TableCell>
                  <TableCell className='capitalize'>
                    {order.payment_method} · {order.payment_status}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.order_status} />
                  </TableCell>
                  <TableCell>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString('en-BD')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='text-muted-foreground hover:text-destructive size-8'
                      aria-label={`Delete ${order.order_number || 'order'}`}
                      onClick={() => setConfirmIds([order.id])}
                    >
                      <Icons.trash className='size-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
