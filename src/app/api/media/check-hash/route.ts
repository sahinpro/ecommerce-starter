import { NextResponse } from 'next/server';

import { findMediaByContentHash } from '@/features/media/api/service';
import { getAdminUser } from '@/lib/auth/session';

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

  const contentHash =
    typeof body === 'object' && body !== null && 'contentHash' in body
      ? String((body as { contentHash: unknown }).contentHash ?? '').trim()
      : '';

  if (!contentHash || contentHash.length < 16) {
    return NextResponse.json({ error: 'contentHash is required.' }, { status: 400 });
  }

  try {
    const asset = await findMediaByContentHash(contentHash);
    return NextResponse.json({ asset });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lookup failed.' },
      { status: 500 }
    );
  }
}
