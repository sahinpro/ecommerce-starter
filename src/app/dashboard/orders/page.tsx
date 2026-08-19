import PageContainer from '@/components/layout/page-container';
import { OrdersListing } from '@/features/orders/components/orders-listing';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Orders'
};

type OrdersPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const date_from = typeof params.date_from === 'string' ? params.date_from : undefined;
  const date_to = typeof params.date_to === 'string' ? params.date_to : undefined;

  return (
    <PageContainer
      pageTitle='Orders'
      pageDescription='Guest Cash on Delivery orders from the storefront.'
    >
      <OrdersListing filters={{ date_from, date_to, page: 1, limit: 50 }} />
    </PageContainer>
  );
}
