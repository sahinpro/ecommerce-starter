import { AnnouncementBar } from './announcement-bar';
import { StorefrontFooter } from './storefront-footer';
import { StorefrontHeader } from './storefront-header';
import { WelcomeOfferDialog } from '../newsletter/welcome-offer-dialog';

type StorefrontShellProps = {
  children: React.ReactNode;
};

export function StorefrontShell({ children }: StorefrontShellProps) {
  return (
    <div className='bg-background text-foreground min-h-screen'>
      <AnnouncementBar />
      <StorefrontHeader />
      <main>{children}</main>
      <StorefrontFooter />
      <WelcomeOfferDialog />
    </div>
  );
}
