import { NavGroup } from '@/types';

/**
 * Sukoon admin navigation (Phase 1 — cleaned starter shell)
 */
export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Products',
        url: '/dashboard/product',
        icon: 'product',
        shortcut: ['p', 'p'],
        isActive: false,
        items: []
      },
      {
        title: 'Media',
        url: '/dashboard/media',
        icon: 'media',
        shortcut: ['m', 'm'],
        isActive: false,
        items: []
      },
      {
        title: 'Orders',
        url: '/dashboard/orders',
        icon: 'shoppingBag',
        shortcut: ['o', 'o'],
        isActive: false,
        items: []
      },
      {
        title: 'Customers',
        url: '/dashboard/customers',
        icon: 'teams',
        shortcut: ['u', 'u'],
        isActive: false,
        items: []
      }
    ]
  }
];
