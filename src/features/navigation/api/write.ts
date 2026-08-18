import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { MenuItemRow } from '@/types/database';

import type {
  MenuItemPayload,
  MenuItemRecord,
  MoveMenuItemPayload,
  ReorderMenuItemsPayload
} from './types';

function navigationError(message: string, cause?: unknown): Error {
  if (cause && typeof cause === 'object' && 'message' in cause) {
    return new Error(`${message}: ${String((cause as { message: unknown }).message)}`);
  }
  return new Error(message);
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

export async function createMenuItem(input: MenuItemPayload): Promise<MenuItemRecord> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      menu_id: input.menu_id,
      parent_id: input.parent_id ?? null,
      label: input.label.trim(),
      link_type: input.link_type,
      link_value: input.link_value.trim(),
      blurb: input.blurb?.trim() || null,
      sort_order: input.sort_order ?? 0,
      updated_at: new Date().toISOString()
    })
    .select('*')
    .single();

  if (error) throw navigationError('Failed to create menu item', error);
  return toItem(data as MenuItemRow);
}

export async function updateMenuItem(
  id: string,
  input: Partial<MenuItemPayload>
): Promise<MenuItemRecord> {
  const supabase = await createSupabaseServerClient();
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };
  if (input.label != null) payload.label = input.label.trim();
  if (input.link_type != null) payload.link_type = input.link_type;
  if (input.link_value != null) payload.link_value = input.link_value.trim();
  if (input.blurb !== undefined) payload.blurb = input.blurb?.trim() || null;
  if (input.parent_id !== undefined) payload.parent_id = input.parent_id;
  if (input.sort_order != null) payload.sort_order = input.sort_order;

  const { data, error } = await supabase
    .from('menu_items')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw navigationError('Failed to update menu item', error);
  return toItem(data as MenuItemRow);
}

export async function deleteMenuItem(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw navigationError('Failed to delete menu item', error);
}

export async function reorderMenuItems(input: ReorderMenuItemsPayload): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();
  const results = await Promise.all(
    input.ordered_ids.map((id, index) =>
      supabase
        .from('menu_items')
        .update({
          parent_id: input.parent_id,
          sort_order: index,
          updated_at: now
        })
        .eq('id', id)
        .eq('menu_id', input.menu_id)
    )
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw navigationError('Failed to reorder menu items', failed.error);
}

export async function moveMenuItem(input: MoveMenuItemPayload): Promise<void> {
  await updateMenuItem(input.id, {
    parent_id: input.parent_id,
    sort_order: input.sort_order
  });
}
