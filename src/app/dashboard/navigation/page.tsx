import PageContainer from '@/components/layout/page-container';
import { NavigationPage } from '@/features/navigation/components/navigation-page';

export const metadata = {
  title: 'Dashboard: Navigation'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='Navigation'
      pageDescription='Control the storefront header, mega-menu, and footer shop links.'
    >
      <NavigationPage />
    </PageContainer>
  );
}
