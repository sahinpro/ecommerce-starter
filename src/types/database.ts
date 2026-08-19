import type { AdminRole } from '@/lib/auth/types';
import type { ProductBadge, ProductStatus } from '@/features/catalog/types';

/** Row shape for public.profiles (dashboard admin/staff). */
export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AdminRole;
  created_at: string;
  updated_at: string;
}

/** Row shape for public.menus (storefront header/footer navigation). */
export interface MenuRow {
  id: string;
  handle: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItemRow {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  link_type: 'category' | 'page' | 'url';
  link_value: string;
  blurb: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

/** Catalog table rows (mirror Supabase schema). */
export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  image_public_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductRow {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  product_type: string | null;
  badge: ProductBadge | null;
  featured: boolean;
  status: ProductStatus;
  composition: string | null;
  care: string | null;
  size_fit: string | null;
  size_fit_image_id: string | null;
  size_fit_image_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MediaAssetRow {
  id: string;
  url: string;
  public_id: string;
  folder: string;
  content_hash: string;
  bytes: number;
  width: number;
  height: number;
  alt: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  url: string;
  public_id: string | null;
  alt: string | null;
  sort_order: number;
  media_asset_id: string | null;
}

export interface ProductColorRow {
  id: string;
  product_id: string;
  name: string;
  hex: string;
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  sku: string;
  barcode: string | null;
  size: string;
  color_id: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  status: 'active' | 'archived';
  option_combination_key: string | null;
  updated_at?: string;
}

export interface StoreSettingsRow {
  id: number;
  shipping_cost: number;
  free_shipping_threshold: number | null;
  currency: string;
  country: string;
  low_stock_threshold: number;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  order_number: string | null;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  address: string | null;
  shipping_area: string | null;
  area: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  subtotal: number;
  shipping_cost: number;
  shipping?: number;
  total: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  status?: string;
  stock_restored: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name?: string;
  product_name_snapshot: string | null;
  sku_snapshot: string | null;
  size?: string | null;
  size_snapshot: string | null;
  color?: string | null;
  color_snapshot: string | null;
  price?: number;
  price_snapshot: number | null;
  quantity: number;
  line_total: number | null;
  option_values_snapshot?: { name: string; value: string }[] | null;
}

type Tables = {
  media_assets: {
    Row: MediaAssetRow;
    Insert: {
      id?: string;
      url: string;
      public_id: string;
      folder?: string;
      content_hash: string;
      bytes?: number;
      width?: number;
      height?: number;
      alt?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      url?: string;
      public_id?: string;
      folder?: string;
      content_hash?: string;
      bytes?: number;
      width?: number;
      height?: number;
      alt?: string | null;
      updated_at?: string;
    };
    Relationships: [];
  };
  profiles: {
    Row: ProfileRow;
    Insert: {
      id: string;
      email: string;
      full_name?: string | null;
      avatar_url?: string | null;
      role?: AdminRole;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      email?: string;
      full_name?: string | null;
      avatar_url?: string | null;
      role?: AdminRole;
      updated_at?: string;
    };
    Relationships: [];
  };
  customers: {
    Row: CustomerRow;
    Insert: {
      id?: string;
      email: string;
      full_name?: string | null;
      phone?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      email?: string;
      full_name?: string | null;
      phone?: string | null;
      updated_at?: string;
    };
    Relationships: [];
  };
  categories: {
    Row: CategoryRow;
    Insert: {
      id?: string;
      slug: string;
      name: string;
      image_url?: string | null;
      image_public_id?: string | null;
      sort_order?: number;
      created_at?: string;
    };
    Update: {
      slug?: string;
      name?: string;
      image_url?: string | null;
      image_public_id?: string | null;
      sort_order?: number;
    };
    Relationships: [];
  };
  products: {
    Row: ProductRow;
    Insert: {
      id?: string;
      slug: string;
      sku: string;
      name: string;
      description?: string | null;
      price: number;
      compare_at_price?: number | null;
      category_id?: string | null;
      product_type?: string | null;
      badge?: ProductRow['badge'];
      featured?: boolean;
      status?: ProductRow['status'];
      composition?: string | null;
      care?: string | null;
      size_fit?: string | null;
      size_fit_image_id?: string | null;
      size_fit_image_url?: string | null;
      created_at?: string;
      updated_at?: string;
      deleted_at?: string | null;
    };
    Update: {
      slug?: string;
      sku?: string;
      name?: string;
      description?: string | null;
      price?: number;
      compare_at_price?: number | null;
      category_id?: string | null;
      product_type?: string | null;
      badge?: ProductRow['badge'];
      featured?: boolean;
      status?: ProductRow['status'];
      composition?: string | null;
      care?: string | null;
      size_fit?: string | null;
      size_fit_image_id?: string | null;
      size_fit_image_url?: string | null;
      updated_at?: string;
      deleted_at?: string | null;
    };
    Relationships: [
      {
        foreignKeyName: 'products_category_id_fkey';
        columns: ['category_id'];
        isOneToOne: false;
        referencedRelation: 'categories';
        referencedColumns: ['id'];
      }
    ];
  };
  product_images: {
    Row: ProductImageRow;
    Insert: {
      id?: string;
      product_id: string;
      url: string;
      public_id?: string | null;
      alt?: string | null;
      sort_order?: number;
      media_asset_id?: string | null;
    };
    Update: {
      url?: string;
      public_id?: string | null;
      alt?: string | null;
      sort_order?: number;
      media_asset_id?: string | null;
    };
    Relationships: [
      {
        foreignKeyName: 'product_images_product_id_fkey';
        columns: ['product_id'];
        isOneToOne: false;
        referencedRelation: 'products';
        referencedColumns: ['id'];
      },
      {
        foreignKeyName: 'product_images_media_asset_id_fkey';
        columns: ['media_asset_id'];
        isOneToOne: false;
        referencedRelation: 'media_assets';
        referencedColumns: ['id'];
      }
    ];
  };
  product_colors: {
    Row: ProductColorRow;
    Insert: {
      id?: string;
      product_id: string;
      name: string;
      hex: string;
    };
    Update: {
      name?: string;
      hex?: string;
    };
    Relationships: [
      {
        foreignKeyName: 'product_colors_product_id_fkey';
        columns: ['product_id'];
        isOneToOne: false;
        referencedRelation: 'products';
        referencedColumns: ['id'];
      }
    ];
  };
  product_variants: {
    Row: ProductVariantRow;
    Insert: {
      id?: string;
      product_id: string;
      sku: string;
      barcode?: string | null;
      size: string;
      color_id?: string | null;
      price: number;
      compare_at_price?: number | null;
      stock_quantity?: number;
      status?: 'active' | 'archived';
      option_combination_key?: string | null;
    };
    Update: {
      sku?: string;
      barcode?: string | null;
      size?: string;
      color_id?: string | null;
      price?: number;
      compare_at_price?: number | null;
      stock_quantity?: number;
      status?: 'active' | 'archived';
      option_combination_key?: string | null;
    };
    Relationships: [
      {
        foreignKeyName: 'product_variants_product_id_fkey';
        columns: ['product_id'];
        isOneToOne: false;
        referencedRelation: 'products';
        referencedColumns: ['id'];
      },
      {
        foreignKeyName: 'product_variants_color_id_fkey';
        columns: ['color_id'];
        isOneToOne: false;
        referencedRelation: 'product_colors';
        referencedColumns: ['id'];
      }
    ];
  };
  store_settings: {
    Row: StoreSettingsRow;
    Insert: Partial<StoreSettingsRow> & { id?: number };
    Update: Partial<StoreSettingsRow>;
    Relationships: [];
  };
  menus: {
    Row: MenuRow;
    Insert: Partial<MenuRow> & { handle: string; title: string };
    Update: Partial<MenuRow>;
    Relationships: [];
  };
  menu_items: {
    Row: MenuItemRow;
    Insert: Partial<MenuItemRow> & {
      menu_id: string;
      label: string;
      link_type: MenuItemRow['link_type'];
      link_value: string;
    };
    Update: Partial<MenuItemRow>;
    Relationships: [];
  };
  orders: {
    Row: OrderRow;
    Insert: Partial<OrderRow> & {
      subtotal: number;
      total: number;
    };
    Update: Partial<OrderRow>;
    Relationships: [];
  };
  order_items: {
    Row: OrderItemRow;
    Insert: Partial<OrderItemRow> & {
      order_id: string;
      quantity: number;
    };
    Update: Partial<OrderItemRow>;
    Relationships: [];
  };
};

export type Database = {
  public: {
    Tables: Tables;
    Views: Record<string, never>;
    Functions: {
      is_dashboard_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      place_cod_order: {
        Args: {
          p_customer_name: string;
          p_customer_phone: string;
          p_address: string;
          p_shipping_area: string;
          p_items: unknown;
        };
        Returns: unknown;
      };
      cancel_order_and_restore_stock: {
        Args: { p_order_id: string };
        Returns: unknown;
      };
      decrement_variant_stock: {
        Args: { p_variant_id: string; p_quantity: number };
        Returns: number;
      };
      add_product_option: {
        Args: { p_product_id: string; p_name: string; p_position?: number | null };
        Returns: unknown;
      };
      add_product_option_value: {
        Args: {
          p_option_id: string;
          p_name: string;
          p_hex?: string | null;
          p_position?: number | null;
        };
        Returns: unknown;
      };
      update_product_option_value: {
        Args: {
          p_value_id: string;
          p_name?: string | null;
          p_hex?: string | null;
          p_position?: number | null;
        };
        Returns: unknown;
      };
      preview_option_value_usage: {
        Args: { p_value_id: string };
        Returns: unknown;
      };
      remove_product_option_value: {
        Args: { p_value_id: string; p_confirm?: boolean };
        Returns: unknown;
      };
      delete_product_option: {
        Args: { p_option_id: string; p_confirm?: boolean };
        Returns: unknown;
      };
      generate_product_variants: {
        Args: { p_product_id: string };
        Returns: unknown;
      };
      upsert_product_variant_full: {
        Args: {
          p_product_id: string;
          p_sku: string;
          p_option_value_ids: string[];
          p_price: number;
          p_compare_at_price?: number | null;
          p_barcode?: string | null;
          p_stock_quantity?: number | null;
          p_status?: string;
          p_variant_id?: string | null;
        };
        Returns: unknown;
      };
      archive_or_delete_variant: {
        Args: { p_variant_id: string };
        Returns: unknown;
      };
      set_variant_inventory: {
        Args: {
          p_variant_id: string;
          p_on_hand: number;
          p_reason?: string;
          p_actor_id?: string | null;
        };
        Returns: number;
      };
      set_variant_media: {
        Args: { p_variant_id: string; p_media_asset_ids: string[] };
        Returns: undefined;
      };
      set_option_value_media: {
        Args: { p_option_value_id: string; p_media_asset_ids: string[] };
        Returns: undefined;
      };
      variant_available_quantity: {
        Args: { p_variant_id: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
