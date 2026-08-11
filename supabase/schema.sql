-- Sukoon e-commerce schema (Figma-aligned)
-- Run in Supabase SQL editor when wiring the backend

create extension if not exists "uuid-ossp";

create table categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  price numeric(12, 2) not null,
  compare_at_price numeric(12, 2),
  category_id uuid references categories(id),
  product_type text,
  badge text check (badge in ('new', 'best_seller', 'back_in_stock', 'sale')),
  featured boolean default false,
  status text default 'active' check (status in ('active', 'draft')),
  composition text,
  care text,
  size_fit text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int default 0
);

create table product_colors (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  hex text not null
);

create table product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  sku text unique not null,
  size text not null,
  color_id uuid references product_colors(id),
  price numeric(12, 2) not null,
  compare_at_price numeric(12, 2),
  stock int default 0
);

create table stories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  excerpt text,
  image_url text,
  link_text text default 'Read the Story',
  published_at timestamptz default now()
);

create table profiles (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text unique,
  email text,
  first_name text,
  last_name text,
  created_at timestamptz default now()
);

create table carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  session_id text,
  updated_at timestamptz default now()
);

create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid references carts(id) on delete cascade,
  variant_id uuid references product_variants(id),
  quantity int not null default 1
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  status text default 'pending',
  subtotal numeric(12, 2) not null,
  shipping numeric(12, 2) default 0,
  total numeric(12, 2) not null,
  currency text default 'BDT',
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  variant_id uuid references product_variants(id),
  product_name text not null,
  size text,
  color text,
  price numeric(12, 2) not null,
  quantity int not null
);

create index idx_products_category on products(category_id);
create index idx_products_slug on products(slug);
create index idx_products_featured on products(featured) where featured = true;
