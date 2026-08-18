import { Suspense } from 'react';

import { CategoryTable, CategoryTableSkeleton } from './category-listing';

export default function CategoryListingPage() {
  return (
    <Suspense fallback={<CategoryTableSkeleton />}>
      <CategoryTable />
    </Suspense>
  );
}
