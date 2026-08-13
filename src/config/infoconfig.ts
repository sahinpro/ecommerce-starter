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
