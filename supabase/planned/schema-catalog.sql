-- REFERENCE — original planned catalog draft (pre–Phase 5A).
-- Prefer applying:
--   supabase/migrations/20260812190000_phase5a_catalog_alignment.sql
-- Living summary:
--   supabase/schema.sql
--
-- This file is kept for historical comparison only.
-- Media URLs point at Cloudinary, not Supabase Storage.

-- (Content preserved from earlier planning; do not apply as-is on top of 5A.)

create extension if not exists "uuid-ossp";

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  price numeric(12, 2) not null,
  compare_at_price numeric(12, 2),
  category_id uuid references categories (id),
  product_type text,
  badge text check (badge in ('new', 'best_seller', 'back_in_stock', 'sale')),
  featured boolean default false,
  status text default 'active' check (status in ('active', 'draft', 'archived')),
  composition text,
  care text,
  size_fit text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products (id) on delete cascade,
  url text not null,
  public_id text,
  alt text,
  sort_order int default 0
);

create table if not exists product_colors (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products (id) on delete cascade,
  name text not null,
  hex text not null
);

create table if not exists product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products (id) on delete cascade,
  sku text unique not null,
  size text not null,
  color_id uuid references product_colors (id),
  price numeric(12, 2) not null,
  compare_at_price numeric(12, 2),
  stock_quantity int default 0
);

create table if not exists stories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  excerpt text,
  image_url text,
  link_text text default 'Read the Story',
  published_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers (id),
  status text default 'pending',
  subtotal numeric(12, 2) not null,
  shipping numeric(12, 2) default 0,
  total numeric(12, 2) not null,
  currency text default 'USD',
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders (id) on delete cascade,
  variant_id uuid references product_variants (id),
  product_name text not null,
  size text,
  color text,
  price numeric(12, 2) not null,
  quantity int not null
);
