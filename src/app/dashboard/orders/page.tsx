import PageContainer from '@/components/layout/page-container';
import { OrdersListing } from '@/features/orders/components/orders-listing';

export const metadata = {
  title: 'Dashboard: Orders'
};

export default function OrdersPage() {
  return (
    <PageContainer
      pageTitle='Orders'
      pageDescription='Guest Cash on Delivery orders from the storefront.'
    >
      <OrdersListing />
    </PageContainer>
  );
}
