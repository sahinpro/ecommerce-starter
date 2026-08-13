import PageContainer from '@/components/layout/page-container';
import { OrderDetail } from '@/features/orders/components/order-detail';

export const metadata = {
  title: 'Dashboard: Order'
};

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailPage(props: PageProps) {
  const { orderId } = await props.params;

  return (
    <PageContainer pageTitle='Order details' pageDescription='Customer, delivery, and line items.'>
      <OrderDetail orderId={orderId} />
    </PageContainer>
  );
}
