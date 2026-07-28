import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { API_URL } from '@/lib/api';

/**
 * Authenticated proxy for client-side CMS calls.
 *
 * Client components (media library, pickers, relation selects) can't read the
 * access token — it lives in the httpOnly session cookie. They call this proxy
 * instead, which verifies the session server-side and forwards the request to
 * the NestJS API with a Bearer token. The token is never exposed to the browser.
 *
 * Only same-origin, authenticated requests reach here; unauthenticated calls
 * get a 401.
 */
async function forward(request: Request, path: string[]) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const target = new URL(`${API_URL}/${path.join('/')}`);
  const incoming = new URL(request.url);
  incoming.searchParams.forEach((value, key) => target.searchParams.set(key, value));

  const headers: Record<string, string> = { authorization: `Bearer ${session.accessToken}` };

  /*
   * Forward `content-type` VERBATIM — including multipart's `; boundary=...`.
   *
   * We relay the raw request bytes, so the body still uses the browser's
   * original boundary. That boundary is declared nowhere except this header;
   * dropping it (expecting fetch to regenerate one) leaves the server parsing
   * multipart data it can't delimit, which surfaces as
   * "multipart: unexpected end of form".
   */
  const contentType = request.headers.get('content-type');
  if (contentType) headers['content-type'] = contentType;

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const requestBody = hasBody ? await request.arrayBuffer() : undefined;

  const res = await fetch(target.toString(), {
    method: request.method,
    headers,
    body: requestBody,
    cache: 'no-store',
  });

  const responseBody = await res.arrayBuffer();
  return new NextResponse(responseBody, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}

export async function GET(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path);
}

export async function POST(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path);
}

export async function PATCH(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path);
}

export async function DELETE(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path);
}
