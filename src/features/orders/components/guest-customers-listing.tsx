import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { listGuestCustomers } from '../service';
import { OrdersLoadError } from './orders-load-error';

export async function GuestCustomersListing() {
  let customers;

  try {
    customers = await listGuestCustomers();
  } catch (error) {
    return (
      <OrdersLoadError
        message={error instanceof Error ? error.message : 'Could not load customers'}
      />
    );
  }

  if (customers.length === 0) {
    return (
      <div className='bg-card text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm'>
        No guest customers yet. When a COD order is placed, the buyer&apos;s name, phone, and
        address will appear here.
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <p className='text-muted-foreground text-sm'>
        {customers.length} guest customer(s) from COD orders
      </p>
      <div className='bg-card rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Last order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.phone}>
                <TableCell className='font-medium'>{customer.full_name}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell className='max-w-xs whitespace-normal'>
                  {customer.address || '—'}
                </TableCell>
                <TableCell>{customer.order_count}</TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/orders/${customer.last_order_id}`}
                    className='cursor-pointer underline-offset-4 hover:underline'
                  >
                    {customer.last_order_number || 'View'}
                  </Link>
                  {customer.last_ordered_at ? (
                    <div className='text-muted-foreground text-xs'>
                      {new Date(customer.last_ordered_at).toLocaleDateString('en-BD')}
                    </div>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
