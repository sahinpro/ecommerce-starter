import { queryOptions } from '@tanstack/react-query';

import { getMenu, getResolvedNav, listMenus } from './service';

export const navigationKeys = {
  all: ['navigation'] as const,
  menus: () => [...navigationKeys.all, 'menus'] as const,
  menu: (handle: string) => [...navigationKeys.all, 'menu', handle] as const,
  resolved: (handle: string) => [...navigationKeys.all, 'resolved', handle] as const
};

export const menusQueryOptions = () =>
  queryOptions({
    queryKey: navigationKeys.menus(),
    queryFn: listMenus
  });

export const menuQueryOptions = (handle: string) =>
  queryOptions({
    queryKey: navigationKeys.menu(handle),
    queryFn: () => getMenu(handle)
  });

export const resolvedNavQueryOptions = (handle: string) =>
  queryOptions({
    queryKey: navigationKeys.resolved(handle),
    queryFn: () => getResolvedNav(handle)
  });
