-- Sukoon schema — living foundation (Phases 3 + 5A)
--
-- Applied migrations:
--   supabase/migrations/20260812100000_phase3_admin_profiles.sql
--   supabase/migrations/20260812190000_phase5a_catalog_alignment.sql
--
-- Architecture:
--   Supabase Auth  → admin/staff only (profiles)
--   customers      → guest checkout business records (not Auth users)
--   catalog        → categories / products / images / colors / variants
--   Cart/Wishlist  → browser localStorage (MVP), not DB tables
--   Media          → Cloudinary URLs + public_id (not Supabase Storage)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Admin / staff profiles (id = auth.users.id)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'admin'
    check (role in ('admin', 'manager', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Guest store customers (NOT Supabase Auth users)
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  image_public_id text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price numeric(12, 2) not null,
  compare_at_price numeric(12, 2),
  category_id uuid references public.categories (id) on delete set null,
  product_type text,
  badge text check (badge is null or badge in ('new', 'best_seller', 'back_in_stock', 'sale')),
  featured boolean not null default false,
  status text not null default 'draft'
    check (status in ('active', 'draft', 'archived')),
  composition text,
  care text,
  size_fit text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  public_id text,
  alt text,
  sort_order int not null default 0
);

create table if not exists public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  hex text not null
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique,
  size text not null,
  color_id uuid references public.product_colors (id) on delete set null,
  price numeric(12, 2) not null,
  compare_at_price numeric(12, 2),
  stock_quantity int not null default 0
);

-- Stories / orders shells may exist for later phases; see migration for RLS lockdown.
