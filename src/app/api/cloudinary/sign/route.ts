import { NextResponse } from 'next/server';

import { getAdminUser } from '@/lib/auth/session';
import { createSignedUpload, isMediaFolderKey } from '@/lib/cloudinary';

/**
 * POST /api/cloudinary/sign
 * Authenticated admin only. Returns signed upload params (never the API secret).
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

  const folderKey =
    typeof body === 'object' && body !== null && 'folderKey' in body
      ? String((body as { folderKey: unknown }).folderKey)
      : '';

  if (!isMediaFolderKey(folderKey)) {
    return NextResponse.json(
      { error: 'Invalid folder. Use products, categories, or general.' },
      { status: 400 }
    );
  }

  try {
    const signed = createSignedUpload(folderKey);
    return NextResponse.json(signed);
  } catch (error) {
    const raw = error instanceof Error ? error.message : '';
    const message =
      raw.includes('not configured') || raw.includes('placeholder')
        ? raw
        : 'Unable to create upload signature.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
