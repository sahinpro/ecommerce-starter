'use client';

import Link from 'next/link';

import { FIGMA_FOOTER_SHOP_LINKS } from '@/features/catalog/figma-taxonomy';
import { cn } from '@/lib/utils';

import { SukoonLogo } from '../brand/sukoon-logo';

const footerLinks: Record<string, readonly { label: string; href: string; external?: boolean }[]> =
  {
    Shop: FIGMA_FOOTER_SHOP_LINKS,
    Information: [
      { label: 'Shipping & Returns', href: '/shipping' },
      { label: 'Terms & Conditions', href: '/terms-of-service' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'FAQs', href: '/faq' }
    ],
    About: [
      { label: 'About', href: '/about' },
      { label: 'Cashmere Care', href: '/about' },
      { label: 'Stores', href: '/about' }
    ],
    Connect: [
      { label: 'Contact', href: '/contact' },
      { label: 'Instagram', href: 'https://instagram.com', external: true },
      { label: 'Facebook', href: 'https://facebook.com', external: true }
    ]
  };

export function StorefrontFooter() {
  return (
    /* Figma 1:173 — 440px, #f7f9f2; form column 450px from left 40 */
    <footer className='bg-sukoon-footer text-sukoon-black md:min-h-110' data-node-id='1:173'>
      <div className='relative mx-auto grid max-w-480 gap-16 px-4 pt-10 pb-10 lg:grid-cols-[450px_minmax(0,1fr)] lg:gap-17.5 lg:pb-25'>
        <div className='flex max-w-112.5 flex-col'>
          <p className='text-[14px] leading-5.5 font-bold tracking-[0.48px] uppercase'>
            Welcome to the world of cashmere
          </p>

          <form className='mt-3.5 space-y-0' onSubmit={(e) => e.preventDefault()} noValidate>
            <label className='block border-b border-black/50'>
              <span className='sr-only'>First Name</span>
              <input
                type='text'
                name='firstName'
                placeholder='First Name'
                className='h-12.25 w-full bg-transparent pt-5 pb-2 text-[14px] tracking-[0.28px] outline-none placeholder:text-black'
              />
            </label>
            <label className='block border-b border-black/50'>
              <span className='sr-only'>Email</span>
              <input
                type='email'
                name='email'
                placeholder='Email'
                className='h-12.25 w-full bg-transparent pt-5 pb-2 text-[14px] tracking-[0.28px] outline-none placeholder:text-black'
              />
            </label>

            <p className='mt-4 text-[11px] leading-5.5 tracking-[0.48px]'>
              By subscribing you agree to receive marketing communications from Sukoon. Unsubscribe
              at any time by clicking the unsubscribe link at the bottom of our emails. View our{' '}
              <Link href='/privacy-policy' className='underline'>
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href='/terms-of-service' className='underline'>
                T&Cs
              </Link>
              .
            </p>

            <button
              type='submit'
              className='mt-6 flex h-11 w-full items-center justify-center border-2 border-[#1d1d1d] bg-black text-[15px] leading-3.75 text-white'
            >
              Sign Up
            </button>
          </form>

          <SukoonLogo variant='footer' className='mt-16 lg:mt-18' />
        </div>

        <div className='grid gap-10 sm:grid-cols-2 lg:mt-1 lg:grid-cols-4 lg:gap-x-8.75'>
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className='mb-5 text-[12px] leading-3 font-bold tracking-[0.24px] uppercase'>
                {section}
              </p>
              <ul className='space-y-[15.39px]'>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className='text-[13px] leading-3.25 tracking-[0.26px] transition-opacity hover:opacity-60'
                      {...('external' in link && link.external
                        ? { target: '_blank', rel: 'noreferrer' }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className='mx-auto max-w-480 px-10 pb-6 lg:pl-240'>
        <div
          className={cn(
            'flex flex-wrap gap-x-12 gap-y-2 text-[11px] leading-4 tracking-[0.44px] text-black/50 uppercase'
          )}
        >
          <span>Copyright {new Date().getFullYear()} © Sukoon</span>
          <a href='https://wenextcoder.com' target='_blank' rel='noreferrer'>
            <span>Site by Next Coder</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
