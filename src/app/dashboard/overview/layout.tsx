import Link from 'next/link';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LOW_STOCK_THRESHOLD } from '@/features/orders/constants';
import { listOrders } from '@/features/orders/service';
import { formatMoney } from '@/lib/format-money';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function getOverviewStats() {
  const supabase = await createSupabaseServerClient();

  const [ordersResult, productsResult, variantsResult] = await Promise.all([
    listOrders({ page: 1, limit: 5 }).catch(() => ({ items: [], total_items: 0 })),
    supabase.from('products').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('product_variants').select('id, stock_quantity, sku')
  ]);

  const variants = (variantsResult.data ?? []) as {
    id: string;
    stock_quantity: number;
    sku: string;
  }[];

  const lowStock = variants.filter(
    (v) => v.stock_quantity > 0 && v.stock_quantity <= LOW_STOCK_THRESHOLD
  );
  const outOfStock = variants.filter((v) => v.stock_quantity <= 0);
  const salesTotal = ordersResult.items.reduce((sum, order) => sum + order.total, 0);

  return {
    recentOrders: ordersResult.items,
    orderCount: ordersResult.total_items,
    productCount: productsResult.count ?? 0,
    lowStock,
    outOfStock,
    salesTotal
  };
}

export default async function OverViewLayout({ children }: { children: React.ReactNode }) {
  const stats = await getOverviewStats();

  const metrics = [
    {
      label: 'Recent sales',
      value: formatMoney(stats.salesTotal),
      hint: 'Sum of the latest listed orders (page sample).'
    },
    {
      label: 'Orders',
      value: String(stats.orderCount),
      hint: 'All COD orders in the database.'
    },
    {
      label: 'Products',
      value: String(stats.productCount),
      hint: 'Catalog products (not deleted).'
    },
    {
      label: 'Out of stock SKUs',
      value: String(stats.outOfStock.length),
      hint: `${stats.lowStock.length} low-stock (≤ ${LOW_STOCK_THRESHOLD}).`
    }
  ] as const;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Dashboard</h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          {metrics.map((metric) => (
            <Card key={metric.label} className='@container/card'>
              <CardHeader>
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  {metric.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground text-sm'>{metric.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>
                <Link
                  href='/dashboard/orders'
                  className='cursor-pointer underline-offset-4 hover:underline'
                >
                  View all orders
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length === 0 ? (
                <p className='text-muted-foreground text-sm'>No orders yet.</p>
              ) : (
                <ul className='space-y-2 text-sm'>
                  {stats.recentOrders.map((order) => (
                    <li key={order.id} className='flex justify-between gap-3'>
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className='cursor-pointer font-medium underline-offset-4 hover:underline'
                      >
                        {order.order_number}
                      </Link>
                      <span>{formatMoney(order.total, order.currency)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Inventory alerts</CardTitle>
              <CardDescription>Low and out-of-stock variants</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.lowStock.length === 0 && stats.outOfStock.length === 0 ? (
                <p className='text-muted-foreground text-sm'>No inventory alerts.</p>
              ) : (
                <ul className='space-y-1 text-sm'>
                  {stats.outOfStock.slice(0, 5).map((v) => (
                    <li key={v.id} className='text-destructive'>
                      {v.sku} · Out of stock
                    </li>
                  ))}
                  {stats.lowStock.slice(0, 5).map((v) => (
                    <li key={v.id} className='text-amber-600'>
                      {v.sku} · {v.stock_quantity} left
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {children}
      </div>
    </PageContainer>
  );
}
