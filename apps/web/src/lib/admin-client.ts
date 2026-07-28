/**
 * Browser-side admin API helper.
 *
 * Routes every call through the same-origin `/api/admin-proxy/*` handler, which
 * injects the Bearer token server-side. Client editors never see the token.
 */
const PROXY = '/api/admin-proxy';

export async function clientGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${PROXY}${path}`, window.location.origin);
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as T;
}

/** Uploads a file to the media library and returns the created record. */
export async function clientUpload(file: File, folder = 'uploads'): Promise<UploadedMedia> {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch(`${PROXY}/admin/media/upload?folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    body,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error((detail as { message?: string }).message ?? 'Upload failed');
  }
  return (await res.json()) as UploadedMedia;
}

export interface UploadedMedia {
  id: string;
  storageKey: string;
  alt?: string | null;
  variants?: Record<string, { url?: string }> | null;
}
