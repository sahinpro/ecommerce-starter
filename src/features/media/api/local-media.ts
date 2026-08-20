export const BUNDLED_MEDIA_ID_PREFIX = 'bundled:';

export function isBundledMediaId(id: string): boolean {
  return id.startsWith(BUNDLED_MEDIA_ID_PREFIX);
}

export function isLocalStorefrontMedia(asset: {
  id?: string | null;
  url?: string | null;
  public_id?: string | null;
  content_hash?: string | null;
  locked?: boolean;
}): boolean {
  if (asset.locked) return true;
  if (asset.id && isBundledMediaId(asset.id)) return true;
  if (asset.content_hash && isBundledMediaId(asset.content_hash)) return true;
  if (asset.public_id?.startsWith('sukoon/')) return true;
  if (asset.url?.startsWith('/sukoon/')) return true;
  return false;
}
