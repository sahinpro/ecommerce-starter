import type {
  Benefit,
  Category,
  CollectionTile,
  FilterOptions,
  Product,
  Story
} from '../api/types';

export const STORE_ANNOUNCEMENT =
  'Founded in Bangladesh. Loved Worldwide.';

export const NAV_LINKS = [
  { label: 'New Arrivals', href: '/shop?category=new-arrivals' },
  { label: 'Women', href: '/shop/women' },
  { label: 'Men', href: '/shop/men' },
  { label: 'Accessories', href: '/shop/accessories' },
  { label: 'About', href: '/about' }
] as const;

export const categories: Category[] = [
  {
    id: 'cat-new',
    slug: 'new-arrivals',
    name: 'New Arrivals',
    image_url:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    sort_order: 0
  },
  {
    id: 'cat-women',
    slug: 'women',
    name: 'Women',
    image_url:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    sort_order: 1
  },
  {
    id: 'cat-men',
    slug: 'men',
    name: 'Men',
    image_url:
      'https://images.unsplash.com/photo-1617137968427-85924c800a41?w=800&q=80',
    sort_order: 2
  },
  {
    id: 'cat-accessories',
    slug: 'accessories',
    name: 'Accessories',
    image_url:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    sort_order: 3
  }
];

export const collectionTiles: CollectionTile[] = [
  {
    id: 'tile-1',
    title: 'Premium Tank',
    image_url:
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
    href: '/shop/women',
    cta: 'Shop Now'
  },
  {
    id: 'tile-2',
    title: 'V Neck Camisole',
    image_url:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    href: '/shop/women',
    cta: 'Shop Now'
  },
  {
    id: 'tile-3',
    title: 'Fine Cotton Tee',
    image_url:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    href: '/shop/men',
    cta: 'Shop Now'
  }
];

export const stories: Story[] = [
  {
    id: 'story-1',
    slug: 'the-journal',
    title: 'The Journal',
    excerpt:
      'Discover the world of Sukoon — where stories of craftsmanship, styling inspiration, and timeless luxury unfold.',
    image_url:
      'https://images.unsplash.com/photo-1483985988355-763728fb1773?w=900&q=80',
    link_text: 'Explore our Stories'
  },
  {
    id: 'story-2',
    slug: 'bangladesh-in-layers',
    title: 'Bangladesh, In Layers That Last',
    excerpt:
      'On a mindful journey through Dhaka, we packed lightly, dressed intentionally, and wore pieces that carry meaning.',
    image_url:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80',
    link_text: 'Read the Story'
  }
];

export const benefits: Benefit[] = [
  {
    id: 'benefit-1',
    title: 'Up to eight times warmer than wool.',
    image_url:
      'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80'
  },
  {
    id: 'benefit-2',
    title: 'Naturally insulating and moisture wicking.',
    image_url:
      'https://images.unsplash.com/photo-1586495777740-3d7714ead081?w=800&q=80'
  },
  {
    id: 'benefit-3',
    title: 'Timeless pieces to be treasured for a lifetime.',
    image_url:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80'
  }
];

export const filterOptions: FilterOptions = {
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  colors: [
    { name: 'Black', hex: '#1a1a1a' },
    { name: 'Ivory', hex: '#f5f0e8' },
    { name: 'Walnut', hex: '#6b4c3b' },
    { name: 'Graphite', hex: '#4a4a4a' },
    { name: 'Indigo', hex: '#2c3e6b' },
    { name: 'Brown Melange', hex: '#8b7355' }
  ],
  product_types: [
    'Cardigans',
    'Crew Necks',
    'V Necks',
    'Pants',
    'Tanks',
    'Tees',
    'Accessories'
  ]
};

function buildProduct(p: Omit<Product, 'created_at' | 'updated_at'>): Product {
  const now = new Date().toISOString();
  return { ...p, created_at: now, updated_at: now };
}

export const products: Product[] = [
  buildProduct({
    id: 'prod-1',
    slug: 'essential-quarter-zip-sweater',
    name: 'Essential Quarter Zip Sweater',
    description:
      'A timeless favourite crafted from premium cotton blend for exceptional softness. Designed with a ribbed collar, hem, and cuffs — versatile layered or worn alone.',
    price: 5500,
    compare_at_price: null,
    category_id: 'cat-men',
    category_slug: 'men',
    product_type: 'Crew Necks',
    badge: 'new',
    featured: true,
    status: 'active',
    composition: '100% premium cotton blend',
    care: 'Hand wash cold. Lay flat to dry.',
    size_fit: 'True to size. Model wears size M.',
    images: [
      {
        id: 'img-1a',
        product_id: 'prod-1',
        url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb08865?w=900&q=80',
        alt: 'Essential Quarter Zip Sweater',
        sort_order: 0
      },
      {
        id: 'img-1b',
        product_id: 'prod-1',
        url: 'https://images.unsplash.com/photo-1617137968427-85924c800a41?w=900&q=80',
        alt: 'Essential Quarter Zip Sweater detail',
        sort_order: 1
      }
    ],
    colors: [
      { id: 'col-1a', name: 'Grey Melange', hex: '#9ca3af' },
      { id: 'col-1b', name: 'Graphite', hex: '#4a4a4a' },
      { id: 'col-1c', name: 'Black', hex: '#1a1a1a' },
      { id: 'col-1d', name: 'Navy', hex: '#1e3a5f' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  }),
  buildProduct({
    id: 'prod-2',
    slug: 'pointelle-tank',
    name: 'Pointelle Tank',
    description:
      'Delicate pointelle knit tank with a relaxed silhouette. Perfect for warm weather layering.',
    price: 2500,
    compare_at_price: null,
    category_id: 'cat-women',
    category_slug: 'women',
    product_type: 'Tanks',
    badge: 'new',
    featured: true,
    status: 'active',
    composition: '100% cotton',
    care: 'Machine wash gentle cycle.',
    size_fit: 'Relaxed fit. Size down for fitted look.',
    images: [
      {
        id: 'img-2a',
        product_id: 'prod-2',
        url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&q=80',
        alt: 'Pointelle Tank',
        sort_order: 0
      }
    ],
    colors: [
      { id: 'col-2a', name: 'Ivory', hex: '#f5f0e8' },
      { id: 'col-2b', name: 'Black', hex: '#1a1a1a' }
    ],
    sizes: ['XS', 'S', 'M', 'L']
  }),
  buildProduct({
    id: 'prod-3',
    slug: 'relaxed-crew-sweater',
    name: 'Relaxed Crew Sweater',
    description:
      'Our best-selling relaxed crew in a soft, breathable knit. An enduring classic for every wardrobe.',
    price: 7900,
    compare_at_price: null,
    category_id: 'cat-men',
    category_slug: 'men',
    product_type: 'Crew Necks',
    badge: 'best_seller',
    featured: true,
    status: 'active',
    composition: '80% cotton, 20% linen',
    care: 'Dry clean recommended.',
    size_fit: 'Oversized fit. Size down for regular fit.',
    images: [
      {
        id: 'img-3a',
        product_id: 'prod-3',
        url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=80',
        alt: 'Relaxed Crew Sweater',
        sort_order: 0
      }
    ],
    colors: [
      { id: 'col-3a', name: 'Black Speckle', hex: '#2d2d2d' },
      { id: 'col-3b', name: 'Walnut', hex: '#6b4c3b' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  }),
  buildProduct({
    id: 'prod-4',
    slug: 'fine-cotton-longline-tee',
    name: 'Fine Cotton Longline Tee',
    description:
      'Extended length tee in our signature fine cotton. Clean lines and effortless drape.',
    price: 4500,
    compare_at_price: null,
    category_id: 'cat-women',
    category_slug: 'women',
    product_type: 'Tees',
    badge: 'new',
    featured: true,
    status: 'active',
    composition: '100% organic cotton',
    care: 'Machine wash cold.',
    size_fit: 'Longline cut. True to size.',
    images: [
      {
        id: 'img-4a',
        product_id: 'prod-4',
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80',
        alt: 'Fine Cotton Longline Tee',
        sort_order: 0
      }
    ],
    colors: [
      { id: 'col-4a', name: 'Ivory', hex: '#f5f0e8' },
      { id: 'col-4b', name: 'Indigo', hex: '#2c3e6b' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  }),
  buildProduct({
    id: 'prod-5',
    slug: 'essential-jogger',
    name: 'Essential Jogger',
    description:
      'Premium jogger with tapered leg and elastic waist. Comfort meets refinement.',
    price: 5000,
    compare_at_price: 7900,
    category_id: 'cat-men',
    category_slug: 'men',
    product_type: 'Pants',
    badge: 'sale',
    featured: false,
    status: 'active',
    composition: '95% cotton, 5% elastane',
    care: 'Machine wash cold. Tumble dry low.',
    size_fit: 'Relaxed through hip and thigh.',
    images: [
      {
        id: 'img-5a',
        product_id: 'prod-5',
        url: 'https://images.unsplash.com/photo-1473966968600-fa801b279a0a?w=900&q=80',
        alt: 'Essential Jogger',
        sort_order: 0
      }
    ],
    colors: [
      { id: 'col-5a', name: 'Black', hex: '#1a1a1a' },
      { id: 'col-5b', name: 'Brown Melange', hex: '#8b7355' },
      { id: 'col-5c', name: 'Graphite', hex: '#4a4a4a' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  }),
  buildProduct({
    id: 'prod-6',
    slug: 'cable-crew-sweater',
    name: 'Cable Crew Sweater',
    description:
      'Classic cable knit crew sweater with heritage detailing. Back in stock by popular demand.',
    price: 3900,
    compare_at_price: 7500,
    category_id: 'cat-men',
    category_slug: 'men',
    product_type: 'Crew Necks',
    badge: 'back_in_stock',
    featured: false,
    status: 'active',
    composition: '100% merino wool blend',
    care: 'Hand wash only.',
    size_fit: 'Regular fit.',
    images: [
      {
        id: 'img-6a',
        product_id: 'prod-6',
        url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb08865?w=900&q=80',
        alt: 'Cable Crew Sweater',
        sort_order: 0
      }
    ],
    colors: [
      { id: 'col-6a', name: 'Brown Melange', hex: '#8b7355' },
      { id: 'col-6b', name: 'Indigo', hex: '#2c3e6b' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  }),
  buildProduct({
    id: 'prod-7',
    slug: 'pointelle-cardigan',
    name: 'Pointelle Cardigan',
    description:
      'Lightweight pointelle cardigan with mother-of-pearl buttons. A wardrobe essential.',
    price: 5500,
    compare_at_price: null,
    category_id: 'cat-women',
    category_slug: 'women',
    product_type: 'Cardigans',
    badge: 'new',
    featured: true,
    status: 'active',
    composition: '100% cotton',
    care: 'Hand wash cold.',
    size_fit: 'True to size.',
    images: [
      {
        id: 'img-7a',
        product_id: 'prod-7',
        url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80',
        alt: 'Pointelle Cardigan',
        sort_order: 0
      }
    ],
    colors: [
      { id: 'col-7a', name: 'Ivory', hex: '#f5f0e8' },
      { id: 'col-7b', name: 'Black', hex: '#1a1a1a' },
      { id: 'col-7c', name: 'Walnut', hex: '#6b4c3b' }
    ],
    sizes: ['XS', 'S', 'M', 'L']
  }),
  buildProduct({
    id: 'prod-8',
    slug: 'leather-crossbody-bag',
    name: 'Leather Crossbody Bag',
    description:
      'Minimal crossbody in vegetable-tanned leather. Adjustable strap and interior pocket.',
    price: 8500,
    compare_at_price: null,
    category_id: 'cat-accessories',
    category_slug: 'accessories',
    product_type: 'Accessories',
    badge: null,
    featured: false,
    status: 'active',
    composition: '100% vegetable-tanned leather',
    care: 'Wipe with damp cloth. Condition periodically.',
    size_fit: 'One size. Strap drop 50–58cm.',
    images: [
      {
        id: 'img-8a',
        product_id: 'prod-8',
        url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=80',
        alt: 'Leather Crossbody Bag',
        sort_order: 0
      }
    ],
    colors: [{ id: 'col-8a', name: 'Black', hex: '#1a1a1a' }],
    sizes: ['One Size']
  }),
  buildProduct({
    id: 'prod-9',
    slug: 'cardigan-with-collar',
    name: 'Cardigan with Collar',
    description:
      'Structured collar cardigan in a fine gauge knit. Limited time sale.',
    price: 3000,
    compare_at_price: 7500,
    category_id: 'cat-men',
    category_slug: 'men',
    product_type: 'Cardigans',
    badge: 'sale',
    featured: false,
    status: 'active',
    composition: '100% cotton',
    care: 'Dry clean only.',
    size_fit: 'Slim fit.',
    images: [
      {
        id: 'img-9a',
        product_id: 'prod-9',
        url: 'https://images.unsplash.com/photo-1617137968427-85924c800a41?w=900&q=80',
        alt: 'Cardigan with Collar',
        sort_order: 0
      }
    ],
    colors: [{ id: 'col-9a', name: 'Black', hex: '#1a1a1a' }],
    sizes: ['S', 'M', 'L', 'XL']
  }),
  buildProduct({
    id: 'prod-10',
    slug: 'cloud-sweatshirt',
    name: 'Cloud Sweatshirt',
    description:
      'Ultra-soft brushed interior sweatshirt. Your everyday luxury layer.',
    price: 7500,
    compare_at_price: null,
    category_id: 'cat-men',
    category_slug: 'men',
    product_type: 'Crew Necks',
    badge: 'new',
    featured: false,
    status: 'active',
    composition: '100% organic cotton fleece',
    care: 'Machine wash cold.',
    size_fit: 'Relaxed fit.',
    images: [
      {
        id: 'img-10a',
        product_id: 'prod-10',
        url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=80',
        alt: 'Cloud Sweatshirt',
        sort_order: 0
      }
    ],
    colors: [
      { id: 'col-10a', name: 'Pebble', hex: '#b8b0a8' },
      { id: 'col-10b', name: 'Steel', hex: '#708090' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  }),
  buildProduct({
    id: 'prod-11',
    slug: 'v-neck-camisole',
    name: 'V Neck Camisole',
    description:
      'Silky V-neck camisole with adjustable straps. Layer under blazers or wear solo.',
    price: 3000,
    compare_at_price: null,
    category_id: 'cat-women',
    category_slug: 'women',
    product_type: 'Tanks',
    badge: null,
    featured: true,
    status: 'active',
    composition: '95% silk, 5% elastane',
    care: 'Hand wash cold.',
    size_fit: 'True to size.',
    images: [
      {
        id: 'img-11a',
        product_id: 'prod-11',
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80',
        alt: 'V Neck Camisole',
        sort_order: 0
      }
    ],
    colors: [
      { id: 'col-11a', name: 'Ivory', hex: '#f5f0e8' },
      { id: 'col-11b', name: 'Black', hex: '#1a1a1a' }
    ],
    sizes: ['XS', 'S', 'M', 'L']
  }),
  buildProduct({
    id: 'prod-12',
    slug: 'saddle-crew',
    name: 'Saddle Crew',
    description:
      'Contrast saddle shoulder crew neck. A Sukoon signature piece.',
    price: 6500,
    compare_at_price: null,
    category_id: 'cat-men',
    category_slug: 'men',
    product_type: 'Crew Necks',
    badge: null,
    featured: false,
    status: 'active',
    composition: '100% cotton',
    care: 'Machine wash gentle.',
    size_fit: 'Regular fit.',
    images: [
      {
        id: 'img-12a',
        product_id: 'prod-12',
        url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb08865?w=900&q=80',
        alt: 'Saddle Crew',
        sort_order: 0
      }
    ],
    colors: [
      { id: 'col-12a', name: 'Black', hex: '#1a1a1a' },
      { id: 'col-12b', name: 'Brown Melange', hex: '#8b7355' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  })
];

export const heroContent = {
  title: 'Premium Comfort, Even in July',
  subtitle: 'Shop Warm-Weather Essentials',
  image_url:
    'https://images.unsplash.com/photo-1617137968427-85924c800a41?w=1920&q=80',
  href: '/shop/men'
};

export const editorialBlock = {
  text: 'Why premium cotton in summer? A rare natural fibre, cotton is moisture-wicking and temperature-regulating by nature — keeping you cool through the heat of the day and softly insulated when evenings dip.'
};
