import { NavGroup } from '@/types';

/**
 * Sukoon admin navigation.
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
      }
    ]
  },
  {
    label: 'Catalog',
    items: [
      {
        title: 'Products',
        url: '/dashboard/product',
        icon: 'product',
        shortcut: ['p', 'p'],
        isActive: false,
        items: []
      },
      {
        title: 'Categories',
        url: '/dashboard/categories',
        icon: 'category',
        shortcut: ['c', 'c'],
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
      }
    ]
  },
  {
    label: 'Orders',
    items: [
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
  },
  {
    label: 'Settings',
    items: [
      {
        title: 'Navigation',
        url: '/dashboard/navigation',
        icon: 'navigation',
        shortcut: ['n', 'n'],
        isActive: false,
        items: []
      },
      {
        title: 'Settings',
        url: '/dashboard/settings',
        icon: 'settings',
        shortcut: ['s', 's'],
        isActive: false,
        items: []
      }
    ]
  }
];
