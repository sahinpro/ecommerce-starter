import 'server-only';

import { getCloudinary } from './config';

const ALLOWED_PUBLIC_ID_PREFIX = 'sukoon/';

/**
 * Deletes a Cloudinary asset by public_id.
 * Only assets under the sukoon/ prefix may be deleted.
 */
export async function deleteCloudinaryAsset(publicId: string): Promise<{ result: string }> {
  const normalized = publicId.trim();

  if (!normalized || normalized.includes('..') || normalized.startsWith('/')) {
    throw new Error('Invalid asset id.');
  }

  if (!normalized.startsWith(ALLOWED_PUBLIC_ID_PREFIX)) {
    throw new Error('Asset is outside the allowed media namespace.');
  }

  const cloudinary = getCloudinary();
  const result = await cloudinary.uploader.destroy(normalized, {
    invalidate: true,
    resource_type: 'image'
  });

  const status = typeof result?.result === 'string' ? result.result : 'unknown';

  if (status !== 'ok' && status !== 'not found') {
    throw new Error('Failed to delete media asset.');
  }

  return { result: status };
}
