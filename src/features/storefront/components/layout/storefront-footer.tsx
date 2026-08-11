'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { SukoonLogo } from '../brand/sukoon-logo';

const footerLinks = {
  shop: [
    { label: 'Best Sellers', href: '/shop' },
    { label: 'Shop All', href: '/shop' }
  ],
  information: [
    { label: 'Shipping & Returns', href: '/shipping' },
    { label: 'Terms & Conditions', href: '/terms-of-service' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'FAQs', href: '/faq' },
    { label: 'Careers', href: '/careers' }
  ],
  about: [
    { label: 'About', href: '/about' },
    { label: 'Fabric Care', href: '/about' },
    { label: 'Stores', href: '/about' }
  ],
  connect: [
    { label: 'Contact', href: '/contact' },
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'Facebook', href: 'https://facebook.com' }
  ]
};

export function StorefrontFooter() {
  return (
    <footer className='border-border border-t bg-white'>
      <div className='mx-auto grid max-w-[1920px] gap-12 px-10 py-10 lg:grid-cols-[450px_1fr]'>
        <div className='space-y-6'>
          <p className='text-xs tracking-[0.2em] uppercase'>
            Welcome to the world of Sukoon
          </p>
          <form className='space-y-4' onSubmit={(e) => e.preventDefault()}>
            <Input
              placeholder='First Name'
              className='h-12 rounded-none border-black/20'
            />
            <Input
              placeholder='Email'
              type='email'
              className='h-12 rounded-none border-black/20'
            />
            <p className='text-muted-foreground text-xs leading-relaxed'>
              By subscribing you agree to receive marketing communications from
              Sukoon. Unsubscribe at any time. View our Privacy Policy and T&Cs.
            </p>
            <Button
              type='submit'
              className='h-11 w-full rounded-none tracking-wide uppercase'
            >
              Sign Up
            </Button>
          </form>
          <SukoonLogo className='pt-8 text-5xl tracking-[0.25em]' href='/' />
        </div>

        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className='mb-4 text-xs tracking-[0.15em] uppercase'>{section}</p>
              <ul className='space-y-3'>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className='text-muted-foreground hover:text-foreground text-[13px] transition-colors'
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

      <div className='border-border text-muted-foreground border-t px-10 py-4 text-xs'>
        <div className='mx-auto flex max-w-[1920px] flex-wrap items-center justify-between gap-2'>
          <p>Copyright {new Date().getFullYear()} © Sukoon</p>
          <p>#1 Premium Cloth Brand · Founded in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
