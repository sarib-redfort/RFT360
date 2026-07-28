import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import type { RevalidatePayload } from '@rft360/shared';

/**
 * On-demand revalidation endpoint.
 *
 * The NestJS API calls this after a publish/unpublish with the affected cache
 * tags (and optionally paths). We verify the shared secret, then invalidate
 * those tags so the statically-rendered pages regenerate on next request —
 * this is what makes CMS edits appear on the live site within seconds.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Revalidation not configured' }, { status: 500 });
  }

  let payload: RevalidatePayload;
  try {
    payload = (await request.json()) as RevalidatePayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (payload.secret !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tags = payload.tags ?? [];
  const paths = payload.paths ?? [];
  for (const tag of tags) revalidateTag(tag);
  for (const path of paths) revalidatePath(path);

  return NextResponse.json({ revalidated: true, tags, paths, now: Date.now() });
}
