import type { PaginatedResult } from '@rft360/shared';

/**
 * Server-side API client.
 *
 * Public reads are fetched from the NestJS API and tagged so the CMS's
 * revalidation webhook (`/api/revalidate`) can refresh exactly the affected
 * pages via `revalidateTag`. Prefer {@link apiGet} in Server Components; use
 * {@link clientFetch} only inside the browser (admin).
 */
const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000/api/v1';

export interface ApiGetOptions {
  /** Next.js cache tags for on-demand revalidation. */
  tags?: string[];
  /** ISR revalidate seconds; defaults to 1h. Use 0 to opt out of caching. */
  revalidate?: number;
  /** Query params appended to the URL. */
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, params?: ApiGetOptions['params']): string {
  const url = new URL(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Fetches JSON from a public API endpoint (Server Components only).
 * Returns `null` on 404 so callers can render a not-found state; throws on
 * other non-OK responses.
 */
export async function apiGet<T>(path: string, options: ApiGetOptions = {}): Promise<T | null> {
  const { tags, revalidate = 3600, params } = options;
  try {
    const res = await fetch(buildUrl(path, params), {
      next: { tags, revalidate },
      headers: { accept: 'application/json' },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`API ${res.status} for ${path}`);
    }
    return (await res.json()) as T;
  } catch (error) {
    // During build or when the API is down, degrade to empty rather than crash.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[api] ${path} failed: ${(error as Error).message}`);
    }
    return null;
  }
}

/** Convenience for list endpoints that return the paginated envelope. */
export async function apiList<T>(
  path: string,
  options: ApiGetOptions = {},
): Promise<PaginatedResult<T>> {
  const result = await apiGet<PaginatedResult<T>>(path, options);
  return result ?? { data: [], meta: emptyMeta() };
}

function emptyMeta() {
  return {
    page: 1,
    limit: 0,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

export { API_URL };
