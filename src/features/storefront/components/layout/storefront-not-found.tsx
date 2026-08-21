import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function StorefrontNotFound() {
  return (
    <div className='flex min-h-[calc(100svh-12rem)] flex-col items-center justify-center px-5 py-20 text-center md:px-10'>
      <p
        aria-hidden
        className='from-foreground bg-linear-to-b to-transparent bg-clip-text font-serif text-[clamp(10rem,16vw,9rem)] leading-none font-bold text-transparent'
      >
        404
      </p>
      <h1 className='font-serif mt-2 text-3xl md:text-4xl'>Something&apos;s missing</h1>
      <p className='text-muted-foreground mt-4 max-w-md text-[15px] leading-relaxed'>
        Sorry, the page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
        <Link
          href='/'
          className={cn(buttonVariants({ size: 'lg' }), 'min-h-11 rounded-none px-8 uppercase')}
        >
          Back to Home
        </Link>
        <Link
          href='/shop'
          className={cn(
            buttonVariants({ size: 'lg', variant: 'outline' }),
            'min-h-11 rounded-none px-8 uppercase'
          )}
        >
          Shop
        </Link>
      </div>
    </div>
  );
}
