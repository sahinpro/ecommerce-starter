import 'server-only';

import { getCloudinary, getCloudinaryServerConfig } from './config';
import { isMediaFolderKey, resolveMediaFolder, type MediaFolderKey } from './folders';
import type { CloudinarySignedUpload } from './types';

/**
 * Creates signed upload parameters for a direct browser → Cloudinary upload.
 * Folder is always application-controlled via an allowlisted key.
 */
export function createSignedUpload(folderKey: MediaFolderKey): CloudinarySignedUpload {
  if (!isMediaFolderKey(folderKey)) {
    throw new Error('Invalid media folder.');
  }

  const folder = resolveMediaFolder(folderKey);
  const { cloudName, apiKey, apiSecret } = getCloudinaryServerConfig();
  const cloudinary = getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder
    },
    apiSecret
  );

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    folderKey
  };
}
