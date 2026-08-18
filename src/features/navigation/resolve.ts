import {
  FIGMA_ABOUT_NAV,
  FIGMA_FOOTER_SHOP_LINKS,
  FIGMA_PRIMARY_CATEGORIES,
  getCollectionNavChildren
} from '@/features/catalog/figma-taxonomy';
import type { Category, NavChildLink, NavPrimaryItem } from '@/features/catalog/types';

import type { MenuLinkType, MenuTree, MenuTreeItem } from './api/types';

/** Used only when the menus table is missing — matches today's hardcoded nav. */
export function fallbackMainNav(): NavPrimaryItem[] {
  return [
    ...FIGMA_PRIMARY_CATEGORIES.map((item) => ({
      id: item.slug,
      label: item.name,
      href: item.href,
      categorySlug: item.slug,
      blurb: item.blurb,
      children: getCollectionNavChildren(item.slug)
    })),
    { ...FIGMA_ABOUT_NAV, id: 'about' }
  ];
}

export function fallbackFooterNav(): NavPrimaryItem[] {
  return FIGMA_FOOTER_SHOP_LINKS.map((item) => ({
    id: item.href,
    label: item.label,
    href: item.href
  }));
}

export function fallbackNav(handle: string): NavPrimaryItem[] {
  return handle === 'footer' ? fallbackFooterNav() : fallbackMainNav();
}

function resolveHref(
  linkType: MenuLinkType,
  linkValue: string,
  categorySlugs: Set<string> | null
): string | null {
  const value = linkValue.trim();
  if (!value) return null;

  if (linkType === 'category') {
    if (categorySlugs && !categorySlugs.has(value)) return null;
    return `/shop/${value}`;
  }

  if (linkType === 'page') {
    return value.startsWith('/') ? value : `/${value.replace(/^\/+/, '')}`;
  }

  if (value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return null;
}

function resolveItem(item: MenuTreeItem, categorySlugs: Set<string> | null): NavPrimaryItem | null {
  const href = resolveHref(item.link_type, item.link_value, categorySlugs);
  if (!href) return null;

  const children: NavChildLink[] = item.children.flatMap((child) => {
    const childHref = resolveHref(child.link_type, child.link_value, categorySlugs);
    if (!childHref) return [];
    return [{ label: child.label, href: childHref }];
  });

  return {
    id: item.id,
    label: item.label,
    href,
    categorySlug: item.link_type === 'category' ? item.link_value : undefined,
    blurb: item.blurb ?? undefined,
    children
  };
}

export function resolveMenuToNav(menu: MenuTree, categories: Category[] | null): NavPrimaryItem[] {
  const slugs = categories ? new Set(categories.map((category) => category.slug)) : null;
  return menu.items.flatMap((item) => {
    const resolved = resolveItem(item, slugs);
    return resolved ? [resolved] : [];
  });
}
