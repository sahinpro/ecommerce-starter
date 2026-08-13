/**
 * Client-safe Cloudinary delivery URL helpers.
 * Uses only NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME — never secrets.
 */

export type CloudinaryTransformOptions = {
  width?: number;
  height?: number;
  crop?: 'fill' | 'limit' | 'fit' | 'thumb' | 'scale';
  quality?: 'auto' | number;
  format?: 'auto' | string;
};

function getPublicCloudName(): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set.');
  }
  return cloudName;
}

/**
 * Builds a transformed Cloudinary delivery URL from a public_id.
 * Defaults to automatic format + quality for storefront-ready delivery.
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  const cloudName = getPublicCloudName();
  const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options;

  const transforms: string[] = [`f_${format}`, `q_${quality}`];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  const pathId = publicId.replace(/^\/+/, '');
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(',')}/${pathId}`;
}

/** Convenience presets for upcoming catalog/storefront surfaces. */
export const cloudinaryPresets = {
  productCard: (publicId: string) =>
    buildCloudinaryUrl(publicId, { width: 600, height: 750, crop: 'fill' }),
  productDetail: (publicId: string) =>
    buildCloudinaryUrl(publicId, { width: 1200, height: 1500, crop: 'limit' }),
  categoryBanner: (publicId: string) =>
    buildCloudinaryUrl(publicId, { width: 1600, height: 600, crop: 'fill' }),
  editorial: (publicId: string) => buildCloudinaryUrl(publicId, { width: 1920, crop: 'limit' })
} as const;
