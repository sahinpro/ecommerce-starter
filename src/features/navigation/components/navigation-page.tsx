import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { categoriesQueryOptions } from '@/features/catalog/queries';
import { getQueryClient } from '@/lib/query-client';

import { menuQueryOptions } from '../api/queries';
import { NavigationManager } from './menu-editor';

function NavigationSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='bg-muted h-10 w-64 rounded-md' />
      <div className='bg-muted h-96 rounded-lg' />
    </div>
  );
}

export function NavigationPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(categoriesQueryOptions());
  void queryClient.prefetchQuery(menuQueryOptions('main-menu'));
  void queryClient.prefetchQuery(menuQueryOptions('footer'));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<NavigationSkeleton />}>
        <NavigationManager />
      </Suspense>
    </HydrationBoundary>
  );
}
