import { mutationOptions } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/query-client';

import {
  createMenuItemAction,
  deleteMenuItemAction,
  moveMenuItemAction,
  reorderMenuItemsAction,
  updateMenuItemAction
} from '../actions';
import { navigationKeys } from './queries';
import type { MenuItemPayload, MoveMenuItemPayload, ReorderMenuItemsPayload } from './types';

function invalidateNavigation(): void {
  void getQueryClient().invalidateQueries({ queryKey: navigationKeys.all });
}

export const createMenuItemMutation = mutationOptions({
  mutationFn: async (payload: MenuItemPayload) => {
    const result = await createMenuItemAction(payload);
    if (!result.ok) throw new Error(result.error);
    return result.data;
  },
  onSuccess: () => invalidateNavigation()
});

export const updateMenuItemMutation = mutationOptions({
  mutationFn: async ({ id, values }: { id: string; values: Partial<MenuItemPayload> }) => {
    const result = await updateMenuItemAction(id, values);
    if (!result.ok) throw new Error(result.error);
  },
  onSuccess: () => invalidateNavigation()
});

export const deleteMenuItemMutation = mutationOptions({
  mutationFn: async (id: string) => {
    const result = await deleteMenuItemAction(id);
    if (!result.ok) throw new Error(result.error);
  },
  onSuccess: () => invalidateNavigation()
});

export const reorderMenuItemsMutation = mutationOptions({
  mutationFn: async (payload: ReorderMenuItemsPayload) => {
    const result = await reorderMenuItemsAction(payload);
    if (!result.ok) throw new Error(result.error);
  },
  onSuccess: () => invalidateNavigation()
});

export const moveMenuItemMutation = mutationOptions({
  mutationFn: async (payload: MoveMenuItemPayload) => {
    const result = await moveMenuItemAction(payload);
    if (!result.ok) throw new Error(result.error);
  },
  onSuccess: () => invalidateNavigation()
});
