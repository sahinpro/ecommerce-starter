'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminUser } from '@/lib/auth/session';

import { menuItemFormSchema } from './schemas/menu-item';
import {
  createMenuItem,
  deleteMenuItem,
  moveMenuItem,
  reorderMenuItems,
  updateMenuItem
} from './api/write';
import type { MenuItemPayload, MoveMenuItemPayload, ReorderMenuItemsPayload } from './api/types';

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

function refreshStorefront(): void {
  revalidatePath('/', 'layout');
  revalidatePath('/shop');
}

export async function createMenuItemAction(
  raw: MenuItemPayload
): Promise<ActionResult<{ id: string }>> {
  await requireAdminUser();
  const parsed = menuItemFormSchema.safeParse({
    label: raw.label,
    link_type: raw.link_type,
    link_value: raw.link_value,
    blurb: raw.blurb ?? ''
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid menu item' };
  }

  try {
    const item = await createMenuItem({
      ...raw,
      ...parsed.data,
      blurb: parsed.data.blurb || null
    });
    refreshStorefront();
    return { ok: true, data: { id: item.id } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not create menu item'
    };
  }
}

export async function updateMenuItemAction(
  id: string,
  raw: Partial<MenuItemPayload>
): Promise<ActionResult> {
  await requireAdminUser();

  if (raw.label != null && raw.link_type != null && raw.link_value != null) {
    const parsed = menuItemFormSchema.safeParse({
      label: raw.label,
      link_type: raw.link_type,
      link_value: raw.link_value,
      blurb: raw.blurb ?? ''
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid menu item' };
    }
  }

  try {
    await updateMenuItem(id, raw);
    refreshStorefront();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not update menu item'
    };
  }
}

export async function deleteMenuItemAction(id: string): Promise<ActionResult> {
  await requireAdminUser();
  try {
    await deleteMenuItem(id);
    refreshStorefront();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not delete menu item'
    };
  }
}

export async function reorderMenuItemsAction(
  payload: ReorderMenuItemsPayload
): Promise<ActionResult> {
  await requireAdminUser();
  try {
    await reorderMenuItems(payload);
    refreshStorefront();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not reorder menu items'
    };
  }
}

export async function moveMenuItemAction(payload: MoveMenuItemPayload): Promise<ActionResult> {
  await requireAdminUser();
  try {
    await moveMenuItem(payload);
    refreshStorefront();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not move menu item'
    };
  }
}
