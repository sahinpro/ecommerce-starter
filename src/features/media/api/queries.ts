import { mutationOptions, queryOptions } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/query-client';

import { deleteMediaAssetClient, fetchMediaAssets, uploadOrReuseMedia } from './client';
import type { MediaListFilters } from './types';
import type { MediaFolderKey } from '@/lib/cloudinary/folders';

export const mediaKeys = {
  all: ['media'] as const,
  list: (filters: MediaListFilters) => [...mediaKeys.all, 'list', filters] as const
};

export const mediaAssetsQueryOptions = (filters: MediaListFilters = {}) =>
  queryOptions({
    queryKey: mediaKeys.list(filters),
    queryFn: () => fetchMediaAssets(filters)
  });

function invalidateMedia(): void {
  void getQueryClient().invalidateQueries({ queryKey: mediaKeys.all });
}

export const uploadMediaMutation = mutationOptions({
  mutationFn: async ({
    file,
    folderKey,
    alt
  }: {
    file: File;
    folderKey?: MediaFolderKey;
    alt?: string | null;
  }) => {
    const result = await uploadOrReuseMedia(file, folderKey ?? 'products', alt);
    return result.asset;
  },
  onSuccess: () => invalidateMedia()
});

export const deleteMediaMutation = mutationOptions({
  mutationFn: (id: string) => deleteMediaAssetClient(id),
  onSuccess: () => invalidateMedia()
});
