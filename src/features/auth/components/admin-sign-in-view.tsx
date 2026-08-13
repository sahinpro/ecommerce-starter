import Link from 'next/link';

import { DashboardTheme } from '@/components/themes/dashboard-theme';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { AdminSignInForm } from './admin-sign-in-form';
import { InteractiveGridPattern } from './interactive-grid';

export default function AdminSignInView() {
  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <DashboardTheme />
      <Link
        href='/admin/sign-in'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 hidden md:top-8 md:right-8'
        )}
      >
        Admin
      </Link>
      <div className='relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-sidebar' />
        <div className='text-sidebar-foreground relative z-20 flex items-center text-lg font-medium'>
          Sukoon
        </div>
        <InteractiveGridPattern
          className={cn(
            'mask-[radial-gradient(400px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[0%] h-full skew-y-12'
          )}
        />
        <div className='text-sidebar-foreground relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>Sukoon store management dashboard.</p>
            <footer className='text-sidebar-foreground/70 text-sm'>Admin access only</footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-sm flex-col items-center justify-center space-y-6'>
          <div className='space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>Admin sign in</h1>
            <p className='text-muted-foreground text-sm'>
              Sign in with your Sukoon dashboard credentials.
            </p>
          </div>
          <AdminSignInForm />
          <p className='text-muted-foreground px-4 text-center text-xs'>
            Authorized staff only. Storefront customers do not need an account.
          </p>
        </div>
      </div>
    </div>
  );
}
