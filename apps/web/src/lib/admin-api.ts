import { auth } from './auth';
import { API_URL } from './api';

/**
 * Authenticated API client for the CMS (Server Components / server actions).
 *
 * Reads the access token from the Auth.js session and attaches it as a Bearer
 * header. Never cached — admin views must always show the latest data,
 * including drafts. Client-side admin calls use {@link adminClientFetch}.
 */
async function authHeaders(): Promise<Record<string, string>> {
  const session = await auth();
  const token = session?.accessToken;
  return token ? { authorization: `Bearer ${token}` } : {};
}

export async function adminGet<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: { accept: 'application/json', ...(await authHeaders()) },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Admin API ${res.status} for ${path}`);
  return (await res.json()) as T;
}

export async function adminMutate<T>(
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      ...(await authHeaders()),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error((detail as { message?: string }).message ?? `Admin API ${res.status}`);
  }
  return (await res.json().catch(() => ({}))) as T;
}
