import PageContainer from '@/components/layout/page-container';
import { GuestCustomersListing } from '@/features/orders/components/guest-customers-listing';

export const metadata = {
  title: 'Dashboard: Customers'
};

export default function CustomersPage() {
  return (
    <PageContainer
      pageTitle='Customers'
      pageDescription='Guest buyers from COD orders — name, phone, and address only.'
    >
      <GuestCustomersListing />
    </PageContainer>
  );
}
