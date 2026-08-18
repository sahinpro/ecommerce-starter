import PageContainer from '@/components/layout/page-container';
import { StoreSettingsForm } from '@/features/orders/components/store-settings-form';
import { getStoreSettings } from '@/features/orders/service';

export const metadata = {
  title: 'Dashboard: Settings'
};

export default async function SettingsPage() {
  const settings = await getStoreSettings();

  return (
    <PageContainer
      pageTitle='Settings'
      pageDescription='Shipping, inventory alerts, and store basics.'
    >
      <StoreSettingsForm settings={settings} />
    </PageContainer>
  );
}
