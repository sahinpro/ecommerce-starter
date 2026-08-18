import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatMoney } from '@/lib/format-money';
import { notFound } from 'next/navigation';

import { shippingAreaLabel } from '../constants';
import { getOrderById } from '../service';
import { OrderStatusForm } from './order-status-form';

export async function OrderDetail({ orderId }: { orderId: string }) {
  const order = await getOrderById(orderId);
  if (!order) notFound();

  return (
    <div className='grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]'>
      <div className='flex flex-col gap-4'>
        <div>
          <h2 className='text-xl font-medium tracking-tight'>{order.order_number}</h2>
          <p className='text-muted-foreground text-sm'>
            {order.created_at ? new Date(order.created_at).toLocaleString('en-BD') : ''}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-base leading-6 font-medium'>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Line</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(order.items ?? []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className='font-medium'>{item.product_name_snapshot}</div>
                      {item.sku_snapshot ? (
                        <div className='text-muted-foreground text-xs'>{item.sku_snapshot}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {[item.size_snapshot, item.color_snapshot].filter(Boolean).join(' / ') || '—'}
                    </TableCell>
                    <TableCell className='tabular-nums'>{item.quantity}</TableCell>
                    <TableCell className='tabular-nums'>
                      {formatMoney(item.price_snapshot, order.currency)}
                    </TableCell>
                    <TableCell className='tabular-nums'>
                      {formatMoney(item.line_total, order.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className='mt-4 flex flex-col gap-1 text-sm'>
              <div className='flex justify-between'>
                <span>Subtotal</span>
                <span className='tabular-nums'>{formatMoney(order.subtotal, order.currency)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Shipping</span>
                <span className='tabular-nums'>
                  {formatMoney(order.shipping_cost, order.currency)}
                </span>
              </div>
              <div className='flex justify-between font-medium'>
                <span>Total</span>
                <span className='tabular-nums'>{formatMoney(order.total, order.currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className='flex flex-col gap-4 lg:sticky lg:top-16'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base leading-6 font-medium'>Status</CardTitle>
          </CardHeader>
          <CardContent className='flex min-w-0 flex-col gap-4'>
            <div className='flex flex-wrap gap-2'>
              <StatusBadge status={order.order_status} />
              <StatusBadge status={order.payment_status}>
                {order.payment_method.toUpperCase()} · {order.payment_status}
              </StatusBadge>
            </div>
            <OrderStatusForm orderId={order.id} currentStatus={order.order_status} />
            <p className='text-muted-foreground text-xs leading-5'>
              Cancelling restores stock once. Delivered marks COD payment as paid.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-base leading-6 font-medium'>Customer</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-1 text-sm'>
            <p className='font-medium'>{order.customer_name}</p>
            <p>{order.customer_phone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-base leading-6 font-medium'>Delivery</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-1 text-sm'>
            <p>{order.address}</p>
            <p>{shippingAreaLabel(order.shipping_area)}</p>
            <p>Shipping fee: {formatMoney(order.shipping_cost, order.currency)}</p>
            <p>{order.country}</p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
