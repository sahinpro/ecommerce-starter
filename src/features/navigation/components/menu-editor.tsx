'use client';

import { useState } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import {
  deleteMenuItemMutation,
  moveMenuItemMutation,
  reorderMenuItemsMutation
} from '../api/mutations';
import { menuQueryOptions } from '../api/queries';
import type { MenuTreeItem } from '../api/types';
import { MENU_HANDLES } from '../constants';
import { MenuItemFormSheet } from './menu-item-form';

type SheetState =
  | { open: false }
  | {
      open: true;
      parentId: string | null;
      sortOrder: number;
      item?: MenuTreeItem;
    };

function nextSortOrder(items: MenuTreeItem[]): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map((item) => item.sort_order)) + 1;
}

function MenuItemActions({
  item,
  siblings,
  parentId,
  canIndent,
  canOutdent,
  onEdit,
  onAddChild
}: {
  item: MenuTreeItem;
  siblings: MenuTreeItem[];
  parentId: string | null;
  canIndent: boolean;
  canOutdent: boolean;
  onEdit: () => void;
  onAddChild: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const index = siblings.findIndex((row) => row.id === item.id);

  const deleteMutation = useMutation({
    ...deleteMenuItemMutation,
    onSuccess: () => {
      toast.success('Menu item deleted');
      setDeleteOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete');
    }
  });

  const moveMutation = useMutation({
    ...moveMenuItemMutation,
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to move item');
    }
  });

  const reorderMutation = useMutation({
    ...reorderMenuItemsMutation,
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reorder');
    }
  });

  function reorder(from: number, to: number) {
    if (to < 0 || to >= siblings.length) return;
    const ordered = siblings.map((row) => row.id);
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    reorderMutation.mutate({
      menu_id: item.menu_id,
      parent_id: parentId,
      ordered_ids: ordered
    });
  }

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(item.id)}
        loading={deleteMutation.isPending}
      />
      <div className='flex items-center gap-1'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-8'
          disabled={index === 0 || reorderMutation.isPending}
          onClick={() => reorder(index, index - 1)}
          aria-label='Move up'
        >
          <Icons.chevronUp className='size-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-8'
          disabled={index === siblings.length - 1 || reorderMutation.isPending}
          onClick={() => reorder(index, index + 1)}
          aria-label='Move down'
        >
          <Icons.chevronDown className='size-4' />
        </Button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
            <span className='sr-only'>Open menu</span>
            <Icons.ellipsis className='h-4 w-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuItem onClick={onEdit}>
              <Icons.edit className='mr-2 h-4 w-4' /> Edit
            </DropdownMenuItem>
            {parentId == null ? (
              <DropdownMenuItem onClick={onAddChild}>
                <Icons.add className='mr-2 h-4 w-4' /> Add child
              </DropdownMenuItem>
            ) : null}
            {canIndent ? (
              <DropdownMenuItem
                onClick={() => {
                  const previous = siblings[index - 1];
                  if (!previous) return;
                  moveMutation.mutate({
                    id: item.id,
                    parent_id: previous.id,
                    sort_order: nextSortOrder(previous.children)
                  });
                }}
              >
                <Icons.chevronRight className='mr-2 h-4 w-4' /> Nest under previous
              </DropdownMenuItem>
            ) : null}
            {canOutdent ? (
              <DropdownMenuItem
                onClick={() => {
                  moveMutation.mutate({
                    id: item.id,
                    parent_id: null,
                    sort_order: item.sort_order
                  });
                }}
              >
                <Icons.chevronLeft className='mr-2 h-4 w-4' /> Move to top level
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
              <Icons.trash className='mr-2 h-4 w-4' /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

function MenuItemRow({
  item,
  siblings,
  parentId,
  depth,
  onEdit,
  onAddChild,
  onDrop
}: {
  item: MenuTreeItem;
  siblings: MenuTreeItem[];
  parentId: string | null;
  depth: number;
  onEdit: (item: MenuTreeItem, parentId: string | null) => void;
  onAddChild: (parent: MenuTreeItem) => void;
  onDrop: (fromId: string, ontoId: string, parentId: string | null) => void;
}) {
  const index = siblings.findIndex((row) => row.id === item.id);

  return (
    <div className='flex flex-col'>
      <div
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData('text/plain', item.id);
          event.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(event) => {
          event.preventDefault();
          const fromId = event.dataTransfer.getData('text/plain');
          if (fromId && fromId !== item.id) onDrop(fromId, item.id, parentId);
        }}
        className={cn(
          'hover:bg-muted/60 flex items-center gap-2 rounded-lg border bg-card px-2 py-2',
          depth > 0 && 'ml-8'
        )}
      >
        <Icons.gripVertical className='text-muted-foreground size-4 shrink-0 cursor-grab' />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium'>{item.label}</p>
          <p className='text-muted-foreground truncate text-xs'>
            {item.link_type} · {item.link_value}
          </p>
        </div>
        <StatusBadge status={item.link_type} />
        <MenuItemActions
          item={item}
          siblings={siblings}
          parentId={parentId}
          canIndent={parentId == null && index > 0}
          canOutdent={parentId != null}
          onEdit={() => onEdit(item, parentId)}
          onAddChild={() => onAddChild(item)}
        />
      </div>
      {item.children.length > 0 ? (
        <div className='mt-2 flex flex-col gap-2'>
          {item.children.map((child) => (
            <MenuItemRow
              key={child.id}
              item={child}
              siblings={item.children}
              parentId={item.id}
              depth={depth + 1}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDrop={onDrop}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MenuEditorPanel({ handle }: { handle: string }) {
  const { data: menu } = useSuspenseQuery(menuQueryOptions(handle));
  const [sheet, setSheet] = useState<SheetState>({ open: false });

  const reorderMutation = useMutation({
    ...reorderMenuItemsMutation,
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reorder');
    }
  });

  if (!menu) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-base font-medium'>Menus table not found</CardTitle>
          <CardDescription>
            Apply <code>supabase/migrations/20260818183000_menus.sql</code> in the Supabase SQL
            editor, then refresh this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const tree = menu;

  function openCreate(parentId: string | null, sortOrder: number) {
    setSheet({ open: true, parentId, sortOrder });
  }

  function handleDrop(fromId: string, ontoId: string, parentId: string | null) {
    const siblings =
      parentId == null
        ? tree.items
        : (tree.items.find((item) => item.id === parentId)?.children ?? []);
    const fromIndex = siblings.findIndex((item) => item.id === fromId);
    const ontoIndex = siblings.findIndex((item) => item.id === ontoId);
    if (fromIndex < 0 || ontoIndex < 0) return;
    const ordered = siblings.map((item) => item.id);
    const [moved] = ordered.splice(fromIndex, 1);
    ordered.splice(ontoIndex, 0, moved);
    reorderMutation.mutate({
      menu_id: tree.id,
      parent_id: parentId,
      ordered_ids: ordered
    });
  }

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-start justify-between gap-4'>
          <div>
            <CardTitle className='text-base font-medium'>{menu.title}</CardTitle>
            <CardDescription>
              Drag to reorder siblings, or nest an item under the previous one. One level of nesting
              is enough for the mega-menu.
            </CardDescription>
          </div>
          <Button size='sm' onClick={() => openCreate(null, nextSortOrder(menu.items))}>
            <Icons.add className='mr-2 h-4 w-4' /> Add item
          </Button>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          {menu.items.length === 0 ? (
            <div className='rounded-lg border border-dashed px-6 py-12 text-center'>
              <p className='text-sm font-medium'>No items yet</p>
              <p className='text-muted-foreground mt-1 text-sm'>
                Add a category, page, or URL to this menu.
              </p>
            </div>
          ) : (
            menu.items.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                siblings={menu.items}
                parentId={null}
                depth={0}
                onEdit={(row, parentId) =>
                  setSheet({
                    open: true,
                    parentId,
                    sortOrder: row.sort_order,
                    item: row
                  })
                }
                onAddChild={(parent) => openCreate(parent.id, nextSortOrder(parent.children))}
                onDrop={handleDrop}
              />
            ))
          )}
        </CardContent>
      </Card>
      {sheet.open ? (
        <MenuItemFormSheet
          key={`${sheet.item?.id ?? 'new'}-${sheet.parentId ?? 'root'}`}
          menuId={menu.id}
          parentId={sheet.parentId}
          sortOrder={sheet.sortOrder}
          item={sheet.item}
          open={sheet.open}
          onOpenChange={(open) => {
            if (!open) setSheet({ open: false });
          }}
        />
      ) : null}
    </>
  );
}

export function NavigationManager() {
  const [handle, setHandle] = useState<(typeof MENU_HANDLES)[number]['handle']>('main-menu');

  return (
    <div className='flex flex-col gap-4'>
      <div role='tablist' aria-label='Menus' className='flex flex-wrap items-center gap-1 border-b'>
        {MENU_HANDLES.map((menu) => {
          const isActive = menu.handle === handle;
          return (
            <button
              key={menu.handle}
              type='button'
              role='tab'
              aria-selected={isActive}
              className={cn(
                'text-muted-foreground hover:text-foreground -mb-px border-b-2 border-transparent px-3 py-2 text-sm transition-colors',
                isActive && 'text-foreground border-foreground font-medium'
              )}
              onClick={() => setHandle(menu.handle)}
            >
              {menu.title}
            </button>
          );
        })}
      </div>
      <MenuEditorPanel key={handle} handle={handle} />
    </div>
  );
}
