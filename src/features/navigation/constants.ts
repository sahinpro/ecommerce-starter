import type { NavPrimaryItem } from '@/features/catalog/types';

export const MENU_HANDLES = [
  { handle: 'main-menu', title: 'Header menu' },
  { handle: 'footer', title: 'Footer menu' }
] as const;

export const STOREFRONT_PAGES = [
  { label: 'About', value: 'about' },
  { label: 'Shop', value: 'shop' },
  { label: 'Contact', value: 'contact' },
  { label: 'FAQ', value: 'faq' },
  { label: 'Shipping & Returns', value: 'shipping' },
  { label: 'Privacy Policy', value: 'privacy-policy' },
  { label: 'Terms of Service', value: 'terms-of-service' },
  { label: 'Cart', value: 'cart' }
] as const;

export const LINK_TYPE_OPTIONS = [
  { label: 'Category', value: 'category' },
  { label: 'Page', value: 'page' },
  { label: 'URL', value: 'url' }
] as const;

export function isExternalHref(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://');
}

export function navToFooterLinks(items: NavPrimaryItem[]): { label: string; href: string }[] {
  return items.map((item) => ({ label: item.label, href: item.href }));
}
