import { NextResponse } from 'next/server';

import { createMediaAsset } from '@/features/media/api/service';
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

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const url = String(raw.url ?? '').trim();
  const publicId = String(raw.public_id ?? raw.publicId ?? '').trim();
  const folder = String(raw.folder ?? 'sukoon/general').trim();
  const contentHash = String(raw.content_hash ?? raw.contentHash ?? '').trim();
  const bytes = Number(raw.bytes ?? 0);
  const width = Number(raw.width ?? 0);
  const height = Number(raw.height ?? 0);
  const alt = raw.alt == null ? null : String(raw.alt);

  if (!url || !publicId || !contentHash) {
    return NextResponse.json(
      { error: 'url, public_id, and content_hash are required.' },
      { status: 400 }
    );
  }

  try {
    const asset = await createMediaAsset({
      url,
      public_id: publicId,
      folder,
      content_hash: contentHash,
      bytes: Number.isFinite(bytes) ? bytes : 0,
      width: Number.isFinite(width) ? width : 0,
      height: Number.isFinite(height) ? height : 0,
      alt
    });
    return NextResponse.json({ asset });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Register failed.' },
      { status: 500 }
    );
  }
}
