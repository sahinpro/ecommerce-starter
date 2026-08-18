import Link from 'next/link';

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

import { shippingAreaLabel } from '../constants';
import { listOrders } from '../service';
import type { OrderFilters } from '../types';
import { OrdersLoadError } from './orders-load-error';

export async function OrdersListing({ filters }: { filters?: OrderFilters }) {
  let items;
  let total_items: number;

  try {
    const result = await listOrders(filters ?? { page: 1, limit: 50 });
    items = result.items;
    total_items = result.total_items;
  } catch (error) {
    return (
      <OrdersLoadError message={error instanceof Error ? error.message : 'Could not load orders'} />
    );
  }

  if (items.length === 0) {
    return (
      <div className='bg-card text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm'>
        No orders yet. Guest COD checkouts will appear here.
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <p className='text-muted-foreground text-sm'>{total_items} order(s)</p>
      <div className='bg-card rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Shipping</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((order) => (
              <TableRow key={order.id}>
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
                <TableCell className='text-xs'>{shippingAreaLabel(order.shipping_area)}</TableCell>
                <TableCell>{formatMoney(order.total, order.currency)}</TableCell>
                <TableCell className='capitalize'>
                  {order.payment_method} · {order.payment_status}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.order_status} />
                </TableCell>
                <TableCell>
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('en-BD') : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
