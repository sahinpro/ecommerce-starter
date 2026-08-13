'use client';

/**
 * Navigation filtering for the dashboard.
 *
 * All configured nav items are shown. Admin access is enforced by
 * Supabase session checks in `src/proxy.ts` (not by nav visibility).
 */

import { useMemo } from 'react';

import type { NavGroup, NavItem } from '@/types';

export function useFilteredNavItems(items: NavItem[]) {
  return useMemo(() => items, [items]);
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  return useMemo(() => groups.filter((group) => group.items.length > 0), [groups]);
}
