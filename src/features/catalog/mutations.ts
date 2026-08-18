import { mutationOptions } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/query-client';

import { catalogKeys } from './queries';
import { createCategory, deleteCategory, updateCategory } from './service';
import type { CategoryMutationPayload } from './types';

function invalidateCatalog(): void {
  void getQueryClient().invalidateQueries({ queryKey: catalogKeys.all });
}

export const createCategoryMutation = mutationOptions({
  mutationFn: (payload: CategoryMutationPayload) => createCategory(payload),
  onSuccess: () => invalidateCatalog()
});

export const updateCategoryMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: Partial<CategoryMutationPayload> }) =>
    updateCategory(id, values),
  onSuccess: () => invalidateCatalog()
});

export const deleteCategoryMutation = mutationOptions({
  mutationFn: (id: string) => deleteCategory(id),
  onSuccess: () => invalidateCatalog()
});
