import type { SupabaseClient } from '@supabase/supabase-js';

import { getCategories } from '@/features/catalog/service';
import type { NavPrimaryItem } from '@/features/catalog/types';
import { createSupabaseAnonClient } from '@/lib/supabase/anon';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { MenuItemRow, MenuRow } from '@/types/database';

import { fallbackNav, resolveMenuToNav } from '../resolve';
import type { MenuItemRecord, MenuRecord, MenuTree, MenuTreeItem } from './types';

function getSupabase(): SupabaseClient {
  if (typeof window === 'undefined') {
    return createSupabaseAnonClient();
  }
  return createSupabaseBrowserClient();
}

function navigationError(message: string, cause?: unknown): Error {
  if (cause && typeof cause === 'object' && 'message' in cause) {
    return new Error(`${message}: ${String((cause as { message: unknown }).message)}`);
  }
  return new Error(message);
}

function isMissingRelation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? String(error.code) : '';
  const message = 'message' in error ? String(error.message).toLowerCase() : '';
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('could not find the table') ||
    message.includes('does not exist')
  );
}

function toItem(row: MenuItemRow): MenuItemRecord {
  return {
    id: row.id,
    menu_id: row.menu_id,
    parent_id: row.parent_id,
    label: row.label,
    link_type: row.link_type,
    link_value: row.link_value,
    blurb: row.blurb,
    sort_order: row.sort_order
  };
}

function nestItems(rows: MenuItemRecord[]): MenuTreeItem[] {
  const byParent = new Map<string | null, MenuItemRecord[]>();
  for (const row of rows) {
    const key = row.parent_id;
    const list = byParent.get(key) ?? [];
    list.push(row);
    byParent.set(key, list);
  }

  for (const list of byParent.values()) {
    list.sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label));
  }

  function childrenOf(parentId: string | null): MenuTreeItem[] {
    return (byParent.get(parentId) ?? []).map((item) => ({
      ...item,
      children: childrenOf(item.id)
    }));
  }

  return childrenOf(null);
}

export async function listMenus(): Promise<MenuRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('title', { ascending: true });
  if (error) {
    if (isMissingRelation(error)) return [];
    throw navigationError('Failed to list menus', error);
  }
  return ((data ?? []) as MenuRow[]).map((row) => ({
    id: row.id,
    handle: row.handle,
    title: row.title
  }));
}

export async function getMenu(handle: string): Promise<MenuTree | null> {
  const supabase = getSupabase();
  const { data: menu, error: menuError } = await supabase
    .from('menus')
    .select('*')
    .eq('handle', handle)
    .maybeSingle();

  if (menuError) {
    if (isMissingRelation(menuError)) return null;
    throw navigationError('Failed to load menu', menuError);
  }
  if (!menu) return null;

  const row = menu as MenuRow;
  const { data: items, error: itemsError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('menu_id', row.id);

  if (itemsError) {
    if (isMissingRelation(itemsError)) return null;
    throw navigationError('Failed to load menu items', itemsError);
  }

  return {
    id: row.id,
    handle: row.handle,
    title: row.title,
    items: nestItems(((items ?? []) as MenuItemRow[]).map(toItem))
  };
}

export async function getResolvedNav(handle: string): Promise<NavPrimaryItem[]> {
  try {
    const [menu, categories] = await Promise.all([
      getMenu(handle),
      getCategories().catch(() => null)
    ]);
    if (!menu) return fallbackNav(handle);
    return resolveMenuToNav(menu, categories);
  } catch (error) {
    if (isMissingRelation(error)) return fallbackNav(handle);
    return fallbackNav(handle);
  }
}
