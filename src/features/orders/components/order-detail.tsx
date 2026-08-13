import { Badge } from '@/components/ui/badge';
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
    <div className='space-y-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h2 className='text-xl font-semibold'>{order.order_number}</h2>
          <p className='text-muted-foreground text-sm'>
            {order.created_at ? new Date(order.created_at).toLocaleString('en-BD') : ''}
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Badge className='capitalize'>{order.order_status}</Badge>
          <Badge variant='secondary' className='capitalize'>
            {order.payment_method} · {order.payment_status}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Update status</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStatusForm orderId={order.id} currentStatus={order.order_status} />
          <p className='text-muted-foreground mt-3 text-xs'>
            Cancelling restores stock once. Delivered marks COD payment as paid.
          </p>
        </CardContent>
      </Card>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Customer</CardTitle>
          </CardHeader>
          <CardContent className='space-y-1 text-sm'>
            <p className='font-medium'>{order.customer_name}</p>
            <p>{order.customer_phone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Delivery</CardTitle>
          </CardHeader>
          <CardContent className='space-y-1 text-sm'>
            <p>{order.address}</p>
            <p>{shippingAreaLabel(order.shipping_area)}</p>
            <p>Shipping fee: {formatMoney(order.shipping_cost, order.currency)}</p>
            <p>{order.country}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Items</CardTitle>
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
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatMoney(item.price_snapshot, order.currency)}</TableCell>
                  <TableCell>{formatMoney(item.line_total, order.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className='mt-4 space-y-1 text-sm'>
            <div className='flex justify-between'>
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal, order.currency)}</span>
            </div>
            <div className='flex justify-between'>
              <span>Shipping Fee</span>
              <span>{formatMoney(order.shipping_cost, order.currency)}</span>
            </div>
            <div className='flex justify-between font-medium'>
              <span>Total</span>
              <span>{formatMoney(order.total, order.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
