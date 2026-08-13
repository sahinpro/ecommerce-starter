import { NextResponse } from 'next/server';

import { getAdminUser } from '@/lib/auth/session';
import { deleteCloudinaryAsset } from '@/lib/cloudinary';

/**
 * POST /api/cloudinary/delete
 * Authenticated admin only. Deletes an asset under sukoon/.
 */
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const publicId =
    typeof body === 'object' && body !== null && 'publicId' in body
      ? String((body as { publicId: unknown }).publicId)
      : '';

  if (!publicId.trim()) {
    return NextResponse.json({ error: 'publicId is required.' }, { status: 400 });
  }

  try {
    const result = await deleteCloudinaryAsset(publicId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete media asset.';

    const status =
      message.includes('not configured') || message.includes('Failed to delete') ? 500 : 400;

    return NextResponse.json(
      {
        error: message.includes('not configured')
          ? 'Cloudinary is not configured on the server.'
          : message
      },
      { status }
    );
  }
}
