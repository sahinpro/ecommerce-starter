import type { InfobarContent } from '@/components/ui/infobar';

export const productInfoContent: InfobarContent = {
  title: 'Product Management',
  sections: [
    {
      title: 'Overview',
      description:
        'The Products page allows you to manage your product catalog. You can view all products in a table format with sorting, filtering, pagination, and search.',
      links: []
    },
    {
      title: 'Adding Products',
      description:
        'To add a new product, click the "Add New" button in the page header and complete the product form.',
      links: []
    },
    {
      title: 'Editing Products',
      description:
        'Edit existing products by opening a product from the table and updating its details.',
      links: []
    },
    {
      title: 'Deleting Products',
      description: 'Products can be removed from the product listing table after confirmation.',
      links: []
    }
  ]
};

export const productFormInfoContent: InfobarContent = {
  title: 'Product editor',
  sections: [
    {
      title: 'Basic info',
      description:
        'Title, slug, SKU, and description identify the product in the catalog and on the storefront.',
      links: []
    },
    {
      title: 'Pricing',
      description:
        'If this product has variants, the Price and Compare-at fields above are ignored. The storefront and product list always use the lowest active variant price. Set prices on each variant in Variants & inventory.',
      links: []
    },
    {
      title: 'Options & Variants',
      description:
        'Add Color and Size options, then generate combinations. Photos attach to each color value (not each size). Edit price, compare-at, and stock on the variant rows.',
      links: []
    },
    {
      title: 'Images',
      description:
        'Product images appear on the storefront gallery. Color-specific photos are set on the Color option values, not on individual size variants.',
      links: []
    },
    {
      title: 'Organization',
      description:
        'Status controls storefront visibility (draft stays hidden). Active requires at least one variant. Category and Featured affect where the product appears in the shop.',
      links: []
    }
  ]
};
