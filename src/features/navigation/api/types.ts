export type MenuHandle = 'main-menu' | 'footer';

export type MenuLinkType = 'category' | 'page' | 'url';

export type MenuRecord = {
  id: string;
  handle: MenuHandle | string;
  title: string;
};

export type MenuItemRecord = {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  link_type: MenuLinkType;
  link_value: string;
  blurb: string | null;
  sort_order: number;
};

export type MenuTreeItem = MenuItemRecord & {
  children: MenuTreeItem[];
};

export type MenuTree = {
  id: string;
  handle: string;
  title: string;
  items: MenuTreeItem[];
};

export type MenuItemPayload = {
  menu_id: string;
  parent_id?: string | null;
  label: string;
  link_type: MenuLinkType;
  link_value: string;
  blurb?: string | null;
  sort_order?: number;
};

export type ReorderMenuItemsPayload = {
  menu_id: string;
  parent_id: string | null;
  ordered_ids: string[];
};

export type MoveMenuItemPayload = {
  id: string;
  parent_id: string | null;
  sort_order: number;
};
