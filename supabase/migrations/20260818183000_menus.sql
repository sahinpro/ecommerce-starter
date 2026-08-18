-- Shopify-style navigation menus (header + footer).
-- Seed matches the previous hardcoded storefront nav so cutover is identical.

create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus (id) on delete cascade,
  parent_id uuid references public.menu_items (id) on delete cascade,
  label text not null,
  link_type text not null check (link_type in ('category', 'page', 'url')),
  link_value text not null,
  blurb text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_menu_id_idx on public.menu_items (menu_id, sort_order);
create index if not exists menu_items_parent_id_idx on public.menu_items (parent_id, sort_order);

alter table public.menus enable row level security;
alter table public.menu_items enable row level security;

drop policy if exists "public read menus" on public.menus;
create policy "public read menus" on public.menus for select using (true);

drop policy if exists "staff write menus" on public.menus;
create policy "staff write menus" on public.menus
  for all using (public.is_dashboard_staff()) with check (public.is_dashboard_staff());

drop policy if exists "public read menu items" on public.menu_items;
create policy "public read menu items" on public.menu_items for select using (true);

drop policy if exists "staff write menu items" on public.menu_items;
create policy "staff write menu items" on public.menu_items
  for all using (public.is_dashboard_staff()) with check (public.is_dashboard_staff());

insert into public.menus (handle, title)
values
  ('main-menu', 'Main menu'),
  ('footer', 'Footer')
on conflict (handle) do nothing;

-- Header: 5 collections + About
insert into public.menu_items (menu_id, parent_id, label, link_type, link_value, blurb, sort_order)
select m.id, null, v.label, v.link_type, v.link_value, v.blurb, v.sort_order
from public.menus m
cross join (
  values
    ('Palestine', 'category', 'palestine', 'Cream tee, “PALESTINE” + flag / Arabic back', 0),
    ('Sukoon', 'category', 'sukoon', 'Cream tee, “SUKOON” + “Seek peace within…”', 1),
    ('Sabr', 'category', 'sabr', 'Black tee, chest “Sabr” / back صبر · PATIENCE', 2),
    ('Tawakkul', 'category', 'tawakkul', 'Black tee, تَوَكَّل / TAWAKKUL + Quran 65:3 art', 3),
    ('Brotherhood', 'category', 'brotherhood', 'Black tee, “BROTHERHOOD” / أخوة handshake art', 4),
    ('About', 'page', 'about', null, 5)
) as v(label, link_type, link_value, blurb, sort_order)
where m.handle = 'main-menu'
  and not exists (
    select 1 from public.menu_items existing
    where existing.menu_id = m.id
      and existing.parent_id is null
      and existing.label = v.label
  );

-- Mega-menu children (Shop All + product types)
insert into public.menu_items (menu_id, parent_id, label, link_type, link_value, sort_order)
select parent.menu_id, parent.id, v.label, 'url', v.href, v.sort_order
from public.menu_items parent
join public.menus m on m.id = parent.menu_id
join (
  values
    ('palestine', 'Shop All', '/shop/palestine', 0),
    ('palestine', 'Tee', '/shop/palestine?types=Tee', 1),
    ('palestine', 'Longsleeve', '/shop/palestine?types=Longsleeve', 2),
    ('sukoon', 'Shop All', '/shop/sukoon', 0),
    ('sukoon', 'Tee', '/shop/sukoon?types=Tee', 1),
    ('sukoon', 'Hoodie', '/shop/sukoon?types=Hoodie', 2),
    ('sabr', 'Shop All', '/shop/sabr', 0),
    ('sabr', 'Tee', '/shop/sabr?types=Tee', 1),
    ('sabr', 'Sweatshirt', '/shop/sabr?types=Sweatshirt', 2),
    ('tawakkul', 'Shop All', '/shop/tawakkul', 0),
    ('tawakkul', 'Tee', '/shop/tawakkul?types=Tee', 1),
    ('tawakkul', 'Longsleeve', '/shop/tawakkul?types=Longsleeve', 2),
    ('brotherhood', 'Shop All', '/shop/brotherhood', 0),
    ('brotherhood', 'Tee', '/shop/brotherhood?types=Tee', 1),
    ('brotherhood', 'Hoodie', '/shop/brotherhood?types=Hoodie', 2)
) as v(parent_slug, label, href, sort_order) on v.parent_slug = parent.link_value
where m.handle = 'main-menu'
  and parent.parent_id is null
  and parent.link_type = 'category'
  and not exists (
    select 1 from public.menu_items existing
    where existing.parent_id = parent.id
      and existing.label = v.label
  );

-- Footer Shop column
insert into public.menu_items (menu_id, parent_id, label, link_type, link_value, sort_order)
select m.id, null, v.label, 'url', v.href, v.sort_order
from public.menus m
cross join (
  values
    ('Best Sellers', '/shop?sort=newest', 0),
    ('Shop All', '/shop', 1)
) as v(label, href, sort_order)
where m.handle = 'footer'
  and not exists (
    select 1 from public.menu_items existing
    where existing.menu_id = m.id
      and existing.parent_id is null
      and existing.label = v.label
  );
