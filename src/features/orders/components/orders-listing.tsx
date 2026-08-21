import { listOrders } from '../service';
import type { OrderFilters } from '../types';
import { OrdersDateFilter } from './orders-date-filter';
import { OrdersLoadError } from './orders-load-error';
import { OrdersTable } from './orders-table';

export async function OrdersListing({ filters }: { filters?: OrderFilters }) {
  const applied = filters ?? { page: 1, limit: 50 };
  const hasDateFilter = Boolean(applied.date_from || applied.date_to);
  let items;
  let total_items: number;

  try {
    const result = await listOrders(applied);
    items = result.items;
    total_items = result.total_items;
  } catch (error) {
    return (
      <OrdersLoadError message={error instanceof Error ? error.message : 'Could not load orders'} />
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <OrdersDateFilter />
        <p className='text-muted-foreground text-sm'>{total_items} order(s)</p>
      </div>

      {items.length === 0 ? (
        <div className='bg-card text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm'>
          {hasDateFilter
            ? 'No orders in this date range.'
            : 'No orders yet. Guest COD checkouts will appear here.'}
        </div>
      ) : (
        <OrdersTable items={items} />
      )}
    </div>
  );
}
