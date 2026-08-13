'use client';

import {
  CLOUDINARY_ALLOWED_MIME_TYPES,
  CLOUDINARY_MAX_FILE_BYTES,
  isAllowedCloudinaryMimeType
} from '@/lib/cloudinary/constants';
import type { MediaFolderKey } from '@/lib/cloudinary/folders';
import {
  mapCloudinaryUploadResponse,
  type CloudinaryAsset,
  type CloudinarySignedUpload,
  type CloudinaryUploadApiResponse
} from '@/lib/cloudinary/types';

async function requestSignedUpload(folderKey: MediaFolderKey): Promise<CloudinarySignedUpload> {
  const response = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folderKey })
  });

  const payload = (await response.json()) as CloudinarySignedUpload | { error?: string };

  if (!response.ok) {
    throw new Error(
      'error' in payload && payload.error ? payload.error : 'Failed to authorize upload.'
    );
  }

  return payload as CloudinarySignedUpload;
}

function validateFile(file: File): void {
  if (!isAllowedCloudinaryMimeType(file.type)) {
    throw new Error('Unsupported file type. Use JPG, PNG, or WebP.');
  }

  if (file.size > CLOUDINARY_MAX_FILE_BYTES) {
    throw new Error('File is too large. Maximum size is 5 MB.');
  }

  if (!(CLOUDINARY_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    throw new Error('Unsupported file type. Use JPG, PNG, or WebP.');
  }
}

/**
 * Signed direct upload: admin session → /api/cloudinary/sign → Cloudinary.
 * Never sends API secrets through this client helper.
 */
export async function uploadImageToCloudinary(
  file: File,
  folderKey: MediaFolderKey = 'general'
): Promise<CloudinaryAsset> {
  validateFile(file);

  const signed = await requestSignedUpload(folderKey);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signed.apiKey);
  formData.append('timestamp', String(signed.timestamp));
  formData.append('signature', signed.signature);
  formData.append('folder', signed.folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`;
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    body: formData
  });

  const uploadPayload = (await uploadResponse.json()) as
    | CloudinaryUploadApiResponse
    | { error?: { message?: string } };

  if (!uploadResponse.ok) {
    const message =
      'error' in uploadPayload && uploadPayload.error?.message
        ? uploadPayload.error.message
        : 'Cloudinary upload failed.';
    throw new Error(message);
  }

  return mapCloudinaryUploadResponse(uploadPayload as CloudinaryUploadApiResponse);
}

export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  const response = await fetch('/api/cloudinary/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId })
  });

  const payload = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to delete media.');
  }
}
