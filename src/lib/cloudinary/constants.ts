/** Client + server shared upload constraints (no secrets). */
export const CLOUDINARY_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
] as const;

export type CloudinaryAllowedMimeType = (typeof CLOUDINARY_ALLOWED_MIME_TYPES)[number];

/** 5 MB — keeps Vercel/browser uploads practical without accepting huge assets. */
export const CLOUDINARY_MAX_FILE_BYTES = 5 * 1024 * 1024;

export const CLOUDINARY_ACCEPT: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp']
};

export function isAllowedCloudinaryMimeType(mime: string): mime is CloudinaryAllowedMimeType {
  return (CLOUDINARY_ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}
