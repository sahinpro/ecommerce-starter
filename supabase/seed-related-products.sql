-- Sukoon — seed sibling products so PDP "You may also like" has a grid.
-- Related products are other active products in the SAME category (no join table).
--
-- Run in Supabase SQL Editor. Safe to re-run (upserts by slug).
-- Images use local public assets until Cloudinary URLs exist.
-- The storefront also falls back to /sukoon/products/plp/vneck-charcoal.png
-- when a product has no image row.

insert into public.categories (slug, name, sort_order)
values
  ('palestine', 'Palestine', 1),
  ('sukoon', 'Sukoon', 2),
  ('sabr', 'Sabr', 3),
  ('tawakkul', 'Tawakkul', 4),
  ('brotherhood', 'Brotherhood', 5)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order;

with catalog (slug, name, description, price, compare_at_price, category_slug, product_type, badge, featured) as (
  values
    -- Palestine (4 siblings → 3 related on a PDP)
    (
      'palestine-cream-tee',
      'Palestine Cream Tee',
      'Cream tee with PALESTINE lettering and flag artwork. Crafted in Bangladesh.',
      2490::numeric, null::numeric, 'palestine', 'Tee', 'new', true
    ),
    (
      'palestine-arabic-back-tee',
      'Palestine Arabic Back Tee',
      'Relaxed cream tee with Arabic back print. Soft cotton, made for here.',
      2490, null, 'palestine', 'Tee', null, false
    ),
    (
      'palestine-oversized-tee',
      'Palestine Oversized Tee',
      'Oversized cream tee. Wear it easy; keep the message clear.',
      2690, 2990, 'palestine', 'Tee', 'best_seller', false
    ),
    (
      'palestine-flag-longsleeve',
      'Palestine Flag Longsleeve',
      'Longsleeve with flag placement print. Layer it through the seasons.',
      2890, null, 'palestine', 'Longsleeve', null, false
    ),

    -- Sukoon
    (
      'sukoon-seek-peace-tee',
      'Sukoon Seek Peace Tee',
      'Cream tee with SUKOON and “Seek peace within…”. Quiet luxury, everyday wear.',
      2490, null, 'sukoon', 'Tee', 'new', true
    ),
    (
      'sukoon-wordmark-tee',
      'Sukoon Wordmark Tee',
      'Clean wordmark on cream cotton. A staple for the collection.',
      2290, null, 'sukoon', 'Tee', null, false
    ),
    (
      'sukoon-box-logo-tee',
      'Sukoon Box Logo Tee',
      'Box mark on the chest. Minimal, heavyweight cotton.',
      2690, null, 'sukoon', 'Tee', 'best_seller', false
    ),
    (
      'sukoon-heavyweight-hoodie',
      'Sukoon Heavyweight Hoodie',
      'Heavyweight hoodie with the Sukoon mark. Warm without the noise.',
      4290, 4790, 'sukoon', 'Hoodie', 'sale', false
    ),

    -- Sabr
    (
      'sabr-patience-tee',
      'Sabr Patience Tee',
      'Black tee, chest Sabr / back صبر · PATIENCE.',
      2490, null, 'sabr', 'Tee', 'new', true
    ),
    (
      'sabr-arabic-tee',
      'Sabr Arabic Tee',
      'Black tee with صبر as the sole back graphic.',
      2490, null, 'sabr', 'Tee', null, false
    ),
    (
      'sabr-cropped-tee',
      'Sabr Cropped Tee',
      'Cropped black tee. Same message, shorter cut.',
      2390, null, 'sabr', 'Tee', null, false
    ),
    (
      'sabr-crewneck',
      'Sabr Crewneck',
      'Black crewneck with Sabr embroidery at the chest.',
      3890, null, 'sabr', 'Sweatshirt', 'best_seller', false
    ),

    -- Tawakkul
    (
      'tawakkul-trust-tee',
      'Tawakkul Trust Tee',
      'Black tee, تَوَكَّل / TAWAKKUL with Quran 65:3 artwork.',
      2490, null, 'tawakkul', 'Tee', 'new', true
    ),
    (
      'tawakkul-ayah-tee',
      'Tawakkul Ayah Tee',
      'Black tee centred on the 65:3 ayah artwork.',
      2490, null, 'tawakkul', 'Tee', null, false
    ),
    (
      'tawakkul-oversized-tee',
      'Tawakkul Oversized Tee',
      'Oversized black tee. Drop shoulder, heavy cotton.',
      2690, null, 'tawakkul', 'Tee', 'best_seller', false
    ),
    (
      'tawakkul-longsleeve',
      'Tawakkul Longsleeve',
      'Black longsleeve with Tawakkul chest print.',
      2890, null, 'tawakkul', 'Longsleeve', null, false
    ),

    -- Brotherhood
    (
      'brotherhood-handshake-tee',
      'Brotherhood Handshake Tee',
      'Black tee, BROTHERHOOD / أخوة handshake art.',
      2490, null, 'brotherhood', 'Tee', 'new', true
    ),
    (
      'brotherhood-arabic-tee',
      'Brotherhood Arabic Tee',
      'Black tee with أخوة as the back graphic.',
      2490, null, 'brotherhood', 'Tee', null, false
    ),
    (
      'brotherhood-oversized-tee',
      'Brotherhood Oversized Tee',
      'Oversized black tee. Handshake print, heavy cotton.',
      2690, 2990, 'brotherhood', 'Tee', 'sale', false
    ),
    (
      'brotherhood-hoodie',
      'Brotherhood Hoodie',
      'Black hoodie with Brotherhood mark. Built for sharing.',
      4290, null, 'brotherhood', 'Hoodie', 'best_seller', false
    )
)
insert into public.products (
  slug,
  name,
  description,
  price,
  compare_at_price,
  category_id,
  product_type,
  badge,
  featured,
  status,
  composition,
  care,
  size_fit,
  deleted_at,
  updated_at
)
select
  catalog.slug,
  catalog.name,
  catalog.description,
  catalog.price,
  catalog.compare_at_price,
  categories.id,
  catalog.product_type,
  catalog.badge,
  catalog.featured,
  'active',
  '100% cotton. Crafted in Bangladesh.',
  'Machine wash cold. Do not bleach. Line dry.',
  'Regular fit. Size up for an oversized look.',
  null,
  now()
from catalog
join public.categories on categories.slug = catalog.category_slug
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    compare_at_price = excluded.compare_at_price,
    category_id = excluded.category_id,
    product_type = excluded.product_type,
    badge = excluded.badge,
    featured = excluded.featured,
    status = 'active',
    composition = excluded.composition,
    care = excluded.care,
    size_fit = excluded.size_fit,
    deleted_at = null,
    updated_at = now();

-- Product photos from Figma PLP frame 1:327 (Men's Cashmere).
delete from public.product_images
where product_id in (
  select id from public.products
  where slug in (
    'palestine-cream-tee', 'palestine-arabic-back-tee', 'palestine-oversized-tee', 'palestine-flag-longsleeve',
    'sukoon-seek-peace-tee', 'sukoon-wordmark-tee', 'sukoon-box-logo-tee', 'sukoon-heavyweight-hoodie',
    'sabr-patience-tee', 'sabr-arabic-tee', 'sabr-cropped-tee', 'sabr-crewneck',
    'tawakkul-trust-tee', 'tawakkul-ayah-tee', 'tawakkul-oversized-tee', 'tawakkul-longsleeve',
    'brotherhood-handshake-tee', 'brotherhood-arabic-tee', 'brotherhood-oversized-tee', 'brotherhood-hoodie'
  )
);

insert into public.product_images (product_id, url, alt, sort_order)
select p.id, m.url, p.name, 0
from public.products p
join (
  values
    ('palestine-cream-tee', '/sukoon/products/plp/quarter-zip-black-navy.png'),
    ('palestine-arabic-back-tee', '/sukoon/products/plp/quarter-zip-brown-melange.jpg'),
    ('palestine-oversized-tee', '/sukoon/products/plp/quarter-zip-grey-melange.png'),
    ('palestine-flag-longsleeve', '/sukoon/products/plp/quarter-zip-navy-black.png'),
    ('sukoon-seek-peace-tee', '/sukoon/products/plp/crew-stripe-walnut.png'),
    ('sukoon-wordmark-tee', '/sukoon/products/plp/relaxed-crew-black-speckle.jpg'),
    ('sukoon-box-logo-tee', '/sukoon/products/plp/relaxed-crew-walnut.jpg'),
    ('sukoon-heavyweight-hoodie', '/sukoon/products/plp/cloud-sweatshirt-pebble.jpg'),
    ('sabr-patience-tee', '/sukoon/products/plp/cloud-sweatshirt-steel.jpg'),
    ('sabr-arabic-tee', '/sukoon/products/plp/relaxed-cardigan-graphite.jpg'),
    ('sabr-cropped-tee', '/sukoon/products/plp/saddle-crew-black.png'),
    ('sabr-crewneck', '/sukoon/products/plp/saddle-crew-brown.png'),
    ('tawakkul-trust-tee', '/sukoon/products/plp/jogger-black.jpg'),
    ('tawakkul-ayah-tee', '/sukoon/products/plp/jogger-brown.jpg'),
    ('tawakkul-oversized-tee', '/sukoon/products/plp/jogger-graphite.jpg'),
    ('tawakkul-longsleeve', '/sukoon/products/plp/cable-crew-brown.jpg'),
    ('brotherhood-handshake-tee', '/sukoon/products/plp/cable-crew-indigo.jpg'),
    ('brotherhood-arabic-tee', '/sukoon/products/plp/cardigan-collar-black.png'),
    ('brotherhood-oversized-tee', '/sukoon/products/plp/cardigan-collar-steel-blue.png'),
    ('brotherhood-hoodie', '/sukoon/products/plp/saddle-crew-wisteria.png')
) as m(slug, url) on m.slug = p.slug;

-- Colors
delete from public.product_variants
where product_id in (
  select id from public.products
  where slug in (
    'palestine-cream-tee', 'palestine-arabic-back-tee', 'palestine-oversized-tee', 'palestine-flag-longsleeve',
    'sukoon-seek-peace-tee', 'sukoon-wordmark-tee', 'sukoon-box-logo-tee', 'sukoon-heavyweight-hoodie',
    'sabr-patience-tee', 'sabr-arabic-tee', 'sabr-cropped-tee', 'sabr-crewneck',
    'tawakkul-trust-tee', 'tawakkul-ayah-tee', 'tawakkul-oversized-tee', 'tawakkul-longsleeve',
    'brotherhood-handshake-tee', 'brotherhood-arabic-tee', 'brotherhood-oversized-tee', 'brotherhood-hoodie'
  )
);

delete from public.product_colors
where product_id in (
  select id from public.products
  where slug in (
    'palestine-cream-tee', 'palestine-arabic-back-tee', 'palestine-oversized-tee', 'palestine-flag-longsleeve',
    'sukoon-seek-peace-tee', 'sukoon-wordmark-tee', 'sukoon-box-logo-tee', 'sukoon-heavyweight-hoodie',
    'sabr-patience-tee', 'sabr-arabic-tee', 'sabr-cropped-tee', 'sabr-crewneck',
    'tawakkul-trust-tee', 'tawakkul-ayah-tee', 'tawakkul-oversized-tee', 'tawakkul-longsleeve',
    'brotherhood-handshake-tee', 'brotherhood-arabic-tee', 'brotherhood-oversized-tee', 'brotherhood-hoodie'
  )
);

insert into public.product_colors (product_id, name, hex)
select p.id, c.name, c.hex
from public.products p
cross join (
  values
    ('Cream', '#F5F0E8'),
    ('Black', '#1D1D1D')
) as c(name, hex)
where p.slug in (
  'palestine-cream-tee', 'palestine-arabic-back-tee', 'palestine-oversized-tee', 'palestine-flag-longsleeve',
  'sukoon-seek-peace-tee', 'sukoon-wordmark-tee', 'sukoon-box-logo-tee', 'sukoon-heavyweight-hoodie',
  'sabr-patience-tee', 'sabr-arabic-tee', 'sabr-cropped-tee', 'sabr-crewneck',
  'tawakkul-trust-tee', 'tawakkul-ayah-tee', 'tawakkul-oversized-tee', 'tawakkul-longsleeve',
  'brotherhood-handshake-tee', 'brotherhood-arabic-tee', 'brotherhood-oversized-tee', 'brotherhood-hoodie'
);

insert into public.product_variants (
  product_id, sku, size, color_id, price, compare_at_price, stock_quantity
)
select
  p.id,
  upper(left(p.slug, 18)) || '-' || left(pc.name, 1) || '-' || s.size,
  s.size,
  pc.id,
  p.price,
  p.compare_at_price,
  12
from public.products p
join public.product_colors pc on pc.product_id = p.id
cross join (
  values ('S'), ('M'), ('L'), ('XL')
) as s(size)
where p.slug in (
  'palestine-cream-tee', 'palestine-arabic-back-tee', 'palestine-oversized-tee', 'palestine-flag-longsleeve',
  'sukoon-seek-peace-tee', 'sukoon-wordmark-tee', 'sukoon-box-logo-tee', 'sukoon-heavyweight-hoodie',
  'sabr-patience-tee', 'sabr-arabic-tee', 'sabr-cropped-tee', 'sabr-crewneck',
  'tawakkul-trust-tee', 'tawakkul-ayah-tee', 'tawakkul-oversized-tee', 'tawakkul-longsleeve',
  'brotherhood-handshake-tee', 'brotherhood-arabic-tee', 'brotherhood-oversized-tee', 'brotherhood-hoodie'
)
on conflict (sku) do update
set size = excluded.size,
    color_id = excluded.color_id,
    price = excluded.price,
    compare_at_price = excluded.compare_at_price,
    stock_quantity = excluded.stock_quantity;
