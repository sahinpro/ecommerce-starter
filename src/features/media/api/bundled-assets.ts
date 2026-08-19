import 'server-only';

import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

import type { MediaAsset } from './types';

export const BUNDLED_MEDIA_ID_PREFIX = 'bundled:';

const BUNDLED_FOLDERS = ['home', 'products', 'swatches'] as const;
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

async function walkImages(
  absoluteDir: string,
  relativeDir: string,
  assets: MediaAsset[]
): Promise<void> {
  let entries;
  try {
    entries = await readdir(absoluteDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const relativePath = `${relativeDir}/${entry.name}`.replaceAll('\\', '/');
    const absolutePath = path.join(absoluteDir, entry.name);
    if (entry.isDirectory()) {
      await walkImages(absolutePath, relativePath, assets);
      continue;
    }
    if (!entry.isFile() || !isImageFile(entry.name)) continue;

    const info = await stat(absolutePath);
    const posixPath = relativePath.replaceAll('\\', '/');
    const root = posixPath.split('/')[0] ?? 'storefront';
    assets.push({
      id: `${BUNDLED_MEDIA_ID_PREFIX}${posixPath}`,
      url: `/sukoon/${posixPath}`,
      public_id: `sukoon/${posixPath}`,
      folder: `sukoon/${root}`,
      content_hash: `${BUNDLED_MEDIA_ID_PREFIX}${posixPath}`,
      bytes: info.size,
      width: 0,
      height: 0,
      alt: entry.name.replace(path.extname(entry.name), '').replaceAll('-', ' '),
      created_at: info.mtime.toISOString(),
      updated_at: info.mtime.toISOString(),
      usage_count: 0,
      locked: true
    });
  }
}

export function isBundledMediaId(id: string): boolean {
  return id.startsWith(BUNDLED_MEDIA_ID_PREFIX);
}

export async function listBundledStorefrontAssets(search?: string): Promise<MediaAsset[]> {
  const root = path.join(process.cwd(), 'public', 'sukoon');
  const assets: MediaAsset[] = [];

  for (const folder of BUNDLED_FOLDERS) {
    await walkImages(path.join(root, folder), folder, assets);
  }

  const query = search?.trim().toLowerCase();
  const filtered = query
    ? assets.filter(
        (asset) =>
          asset.public_id.toLowerCase().includes(query) ||
          (asset.alt ?? '').toLowerCase().includes(query) ||
          asset.folder.toLowerCase().includes(query)
      )
    : assets;

  return filtered.toSorted((a, b) => a.public_id.localeCompare(b.public_id));
}
