-- Override seeded product photos with Figma PLP frame 1:327 (Men's Cashmere).
-- Run this if you already ran seed-related-products.sql.

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
