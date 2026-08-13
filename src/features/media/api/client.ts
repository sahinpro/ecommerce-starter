'use client';

import type { MediaFolderKey } from '@/lib/cloudinary/folders';
import { resolveMediaFolder } from '@/lib/cloudinary/folders';

import { hashFileSha256 } from './hash';
import type { MediaAsset, MediaListFilters } from './types';
import { uploadImageToCloudinary } from './upload-client';

export async function fetchMediaAssets(filters: MediaListFilters = {}): Promise<MediaAsset[]> {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.folder?.trim()) params.set('folder', filters.folder.trim());

  const response = await fetch(`/api/media?${params.toString()}`, { method: 'GET' });
  const payload = (await response.json()) as { items?: MediaAsset[]; error?: string };
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to load media library.');
  }
  return payload.items ?? [];
}

export async function checkMediaHash(contentHash: string): Promise<MediaAsset | null> {
  const response = await fetch('/api/media/check-hash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentHash })
  });
  const payload = (await response.json()) as { asset?: MediaAsset | null; error?: string };
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to check for duplicate media.');
  }
  return payload.asset ?? null;
}

export async function registerMediaAsset(input: {
  url: string;
  public_id: string;
  folder: string;
  content_hash: string;
  bytes: number;
  width: number;
  height: number;
  alt?: string | null;
}): Promise<MediaAsset> {
  const response = await fetch('/api/media/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  const payload = (await response.json()) as { asset?: MediaAsset; error?: string };
  if (!response.ok || !payload.asset) {
    throw new Error(payload.error || 'Failed to register media.');
  }
  return payload.asset;
}

export async function deleteMediaAssetClient(id: string): Promise<void> {
  const response = await fetch(`/api/media?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to delete media.');
  }
}

/**
 * Upload-or-reuse: hash → library lookup → Cloudinary only when new → register.
 */
export type UploadOrReuseResult = {
  asset: MediaAsset;
  reused: boolean;
};

export async function uploadOrReuseMedia(
  file: File,
  folderKey: MediaFolderKey = 'products',
  alt?: string | null
): Promise<UploadOrReuseResult> {
  const contentHash = await hashFileSha256(file);
  const existing = await checkMediaHash(contentHash);
  if (existing) {
    return { asset: existing, reused: true };
  }

  const uploaded = await uploadImageToCloudinary(file, folderKey);
  const asset = await registerMediaAsset({
    url: uploaded.secureUrl,
    public_id: uploaded.publicId,
    folder: uploaded.folder || resolveMediaFolder(folderKey),
    content_hash: contentHash,
    bytes: uploaded.bytes,
    width: uploaded.width,
    height: uploaded.height,
    alt: alt ?? null
  });
  return { asset, reused: false };
}
