import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { deleteCloudinaryAsset } from '@/lib/cloudinary';
import { getAdminUser } from '@/lib/auth/session';

import type { MediaAsset, MediaAssetCreateInput, MediaListFilters } from './types';
import { isBundledMediaId, listBundledStorefrontAssets } from './bundled-assets';

async function assertAdmin(): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) {
    throw new Error('Unauthorized');
  }
}

function mapAsset(row: Record<string, unknown>, usageCount?: number): MediaAsset {
  return {
    id: String(row.id),
    url: String(row.url),
    public_id: String(row.public_id),
    folder: String(row.folder ?? 'sukoon/general'),
    content_hash: String(row.content_hash),
    bytes: Number(row.bytes ?? 0),
    width: Number(row.width ?? 0),
    height: Number(row.height ?? 0),
    alt: row.alt == null ? null : String(row.alt),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    usage_count: usageCount
  };
}

export async function findMediaByContentHash(contentHash: string): Promise<MediaAsset | null> {
  await assertAdmin();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('media_assets')
    .select('*')
    .eq('content_hash', contentHash)
    .maybeSingle();

  if (error) throw new Error(error.message || 'Failed to look up media by hash');
  if (!data) return null;
  return mapAsset(data as Record<string, unknown>);
}

export async function createMediaAsset(input: MediaAssetCreateInput): Promise<MediaAsset> {
  await assertAdmin();
  const admin = createSupabaseAdminClient();

  const { data: existingRow } = await admin
    .from('media_assets')
    .select('*')
    .eq('content_hash', input.content_hash)
    .maybeSingle();
  if (existingRow) return mapAsset(existingRow as Record<string, unknown>);

  const { data, error } = await admin
    .from('media_assets')
    .insert({
      url: input.url,
      public_id: input.public_id,
      folder: input.folder,
      content_hash: input.content_hash,
      bytes: input.bytes,
      width: input.width,
      height: input.height,
      alt: input.alt ?? null
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: again } = await admin
        .from('media_assets')
        .select('*')
        .eq('content_hash', input.content_hash)
        .maybeSingle();
      if (again) return mapAsset(again as Record<string, unknown>);
    }
    throw new Error(error.message || 'Failed to register media asset');
  }

  return mapAsset(data as Record<string, unknown>);
}

export async function listMediaAssets(filters: MediaListFilters = {}): Promise<MediaAsset[]> {
  await assertAdmin();
  const admin = createSupabaseAdminClient();

  const bundled = await listBundledStorefrontAssets(filters.search);
  const bundledFiltered = filters.folder?.trim()
    ? bundled.filter((asset) => asset.folder === filters.folder?.trim())
    : bundled;

  let query = admin
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filters.folder?.trim()) {
    query = query.eq('folder', filters.folder.trim());
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    query = query.or(`alt.ilike.%${q}%,public_id.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message || 'Failed to list media');

  const assets = (data ?? []).map((row) => mapAsset(row as Record<string, unknown>));
  if (!assets.length) return bundledFiltered;

  const ids = assets.map((asset) => asset.id);
  const { data: usages, error: usageError } = await admin
    .from('product_images')
    .select('media_asset_id')
    .in('media_asset_id', ids);

  if (usageError) throw new Error(usageError.message || 'Failed to count media usage');

  const counts = new Map<string, number>();
  for (const row of usages ?? []) {
    const id = row.media_asset_id as string | null;
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const uploaded = assets.map((asset) => ({
    ...asset,
    usage_count: counts.get(asset.id) ?? 0
  }));

  return [...bundledFiltered, ...uploaded];
}

export async function getMediaUsageCount(mediaAssetId: string): Promise<number> {
  await assertAdmin();
  const admin = createSupabaseAdminClient();
  const { count, error } = await admin
    .from('product_images')
    .select('id', { count: 'exact', head: true })
    .eq('media_asset_id', mediaAssetId);

  if (error) throw new Error(error.message || 'Failed to count media usage');
  return count ?? 0;
}

export async function deleteMediaAsset(id: string): Promise<void> {
  await assertAdmin();
  if (isBundledMediaId(id)) {
    throw new Error('Storefront images cannot be removed from the media library.');
  }
  const admin = createSupabaseAdminClient();

  const { data: asset, error: loadError } = await admin
    .from('media_assets')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (loadError) throw new Error(loadError.message || 'Failed to load media asset');
  if (!asset) throw new Error('Media asset not found');

  const usage = await getMediaUsageCount(id);
  if (usage > 0) {
    throw new Error(
      `This image is used on ${usage} product${usage === 1 ? '' : 's'}. Remove it from products first.`
    );
  }

  const publicId = String((asset as { public_id: string }).public_id);
  if (publicId && !publicId.startsWith('legacy/')) {
    try {
      await deleteCloudinaryAsset(publicId);
    } catch {
      // Still remove DB row if Cloudinary asset is already gone.
    }
  }

  const { error: deleteError } = await admin.from('media_assets').delete().eq('id', id);
  if (deleteError) throw new Error(deleteError.message || 'Failed to delete media asset');
}
