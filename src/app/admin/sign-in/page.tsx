import type { Metadata } from 'next';
import { Suspense } from 'react';

import AdminSignInView from '@/features/auth/components/admin-sign-in-view';

export const metadata: Metadata = {
  title: 'Admin Sign In | Sukoon',
  description: 'Sign in to the Sukoon store management dashboard.',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminSignInPage() {
  return (
    <Suspense fallback={null}>
      <AdminSignInView />
    </Suspense>
  );
}
