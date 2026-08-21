'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/auth');
  const homeHref = isDashboard ? '/dashboard/overview' : '/';

  return (
    <div className='flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center'>
      <span className='from-foreground bg-linear-to-b to-transparent bg-clip-text text-[10rem] leading-none font-extrabold text-transparent'>
        404
      </span>
      <h1 className='font-heading my-2 text-2xl font-bold'>Something&apos;s missing</h1>
      <p>Sorry, the page you are looking for doesn&apos;t exist or has been moved.</p>
      <div className='mt-8 flex flex-wrap justify-center gap-2'>
        <Button onClick={() => router.back()} variant='default' size='lg'>
          Go back
        </Button>
        <Link
          href={homeHref}
          className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'inline-flex')}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
