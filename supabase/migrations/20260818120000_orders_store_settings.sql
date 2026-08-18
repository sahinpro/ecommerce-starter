-- Additive catch-up for environments that already have catalog tables.
-- New environments should apply supabase/schema.sql instead.
--
-- Does NOT replace an existing place_cod_order() body if one is already installed.

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  public_id text not null unique,
  folder text not null default 'sukoon/general',
  content_hash text not null unique,
  bytes int not null default 0,
  width int not null default 0,
  height int not null default 0,
  alt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_images
  add column if not exists media_asset_id uuid references public.media_assets (id) on delete set null;

create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),
  shipping_cost numeric(12, 2) not null default 80,
  free_shipping_threshold numeric(12, 2),
  currency text not null default 'BDT',
  country text not null default 'Bangladesh',
  low_stock_threshold int not null default 5,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  customer_id uuid references public.customers (id) on delete set null,
  customer_name text,
  customer_phone text,
  customer_email text,
  address text,
  shipping_area text,
  area text,
  city text,
  postal_code text,
  country text not null default 'Bangladesh',
  subtotal numeric(12, 2) not null,
  shipping_cost numeric(12, 2) not null default 0,
  shipping numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  currency text not null default 'BDT',
  payment_method text not null default 'cod',
  payment_status text not null default 'pending',
  order_status text not null default 'pending',
  status text not null default 'pending',
  stock_restored boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text,
  product_name_snapshot text,
  sku_snapshot text,
  size text,
  size_snapshot text,
  color text,
  color_snapshot text,
  price numeric(12, 2),
  price_snapshot numeric(12, 2),
  quantity int not null,
  line_total numeric(12, 2)
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_customer_phone_idx on public.orders (customer_phone);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
