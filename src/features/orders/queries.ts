import { queryOptions } from '@tanstack/react-query';

import { getOrderById, listOrders } from './service';
import type { OrderFilters } from './types';

export const orderKeys = {
  all: ['orders'] as const,
  list: (filters: OrderFilters) => [...orderKeys.all, 'list', filters] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const
};

export function ordersQueryOptions(filters: OrderFilters = {}) {
  return queryOptions({
    queryKey: orderKeys.list(filters),
    queryFn: () => listOrders(filters)
  });
}

export function orderDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrderById(id)
  });
}
