/**
 * Cloudinary media folder keys controlled by the application.
 * Browsers may request a key; they cannot invent arbitrary folder paths.
 */
export const MEDIA_FOLDERS = {
  products: 'sukoon/products',
  categories: 'sukoon/categories',
  general: 'sukoon/general'
} as const;

export type MediaFolderKey = keyof typeof MEDIA_FOLDERS;

export function isMediaFolderKey(value: string): value is MediaFolderKey {
  return value in MEDIA_FOLDERS;
}

export function resolveMediaFolder(key: MediaFolderKey): string {
  return MEDIA_FOLDERS[key];
}
