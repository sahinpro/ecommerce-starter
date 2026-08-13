import 'server-only';

import { v2 as cloudinary } from 'cloudinary';

export type CloudinaryServerConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function isPlaceholderSecret(value: string): boolean {
  return (
    value === 'your-api-secret' ||
    /^\*+$/.test(value) ||
    value.includes('***') ||
    value.toLowerCase() === 'changeme'
  );
}

/**
 * Reads Cloudinary credentials. Secrets stay server-only.
 * Throws a safe error if misconfigured (no secret values in the message).
 */
export function getCloudinaryServerConfig(): CloudinaryServerConfig {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    );
  }

  if (isPlaceholderSecret(apiSecret)) {
    throw new Error(
      'Cloudinary API secret is a placeholder. Paste the real API Secret from Cloudinary Dashboard → Settings → API Keys into CLOUDINARY_API_SECRET, then restart the dev server.'
    );
  }

  return { cloudName, apiKey, apiSecret };
}

/** Configures and returns the official Cloudinary SDK (server-only). */
export function getCloudinary(): typeof cloudinary {
  const { cloudName, apiKey, apiSecret } = getCloudinaryServerConfig();

  // Always re-apply — env can change after restart; avoid sticky wrong secret.
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  return cloudinary;
}
