/** Shared Cloudinary asset shape for Phase 5+ catalog records. */
export interface CloudinaryAsset {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  folder?: string;
  originalFilename?: string;
}

/** Server-issued params for a signed browser → Cloudinary upload. */
export interface CloudinarySignedUpload {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  folderKey: string;
}

export interface CloudinarySignRequest {
  folderKey: string;
}

export interface CloudinaryDeleteRequest {
  publicId: string;
}

/** Raw Cloudinary upload API JSON (subset we rely on). */
export interface CloudinaryUploadApiResponse {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  folder?: string;
  original_filename?: string;
}

export function mapCloudinaryUploadResponse(payload: CloudinaryUploadApiResponse): CloudinaryAsset {
  return {
    publicId: payload.public_id,
    secureUrl: payload.secure_url,
    resourceType: payload.resource_type,
    format: payload.format,
    width: payload.width,
    height: payload.height,
    bytes: payload.bytes,
    folder: payload.folder,
    originalFilename: payload.original_filename
  };
}
