import { clsx, type ClassValue } from 'clsx';

/** Conditional className concatenation. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** The public base URL that serves uploaded media (the API's /uploads route). */
const MEDIA_BASE = (
  process.env.NEXT_PUBLIC_MEDIA_URL ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '/uploads') ??
  'http://localhost:4000/uploads'
).replace(/\/$/, '');

/** The shape the API returns for a referenced media item. */
export interface MediaRef {
  id?: string;
  storageKey?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  blurDataUrl?: string | null;
  variants?: Record<string, { key?: string; url?: string; width?: number; height?: number }> | null;
}

/** Resolves a driver storage key to an absolute URL. Passes through full URLs. */
export function mediaUrl(key?: string | null): string | null {
  if (!key) return null;
  if (/^https?:\/\//.test(key)) return key;
  return `${MEDIA_BASE}/${key.replace(/^\//, '')}`;
}

/**
 * Best URL for a media item at a requested size, falling back through the
 * generated variants to the original.
 */
export function mediaSrc(
  media: MediaRef | null | undefined,
  variant: 'thumbnail' | 'medium' | 'large' = 'medium',
): string | null {
  if (!media) return null;
  const v = media.variants?.[variant];
  if (v?.url) return v.url;
  if (v?.key) return mediaUrl(v.key);
  return mediaUrl(media.storageKey);
}

/** Formats an ISO date for display, e.g. "25 Jul 2026". */
export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Absolute site origin — canonical URLs, OG tags, sitemap, JSON-LD and share
 * links. Every consumer is server-rendered.
 *
 * The Vercel fallback exists to break a chicken-and-egg on the first deploy:
 * you cannot know the deployment URL until after it deploys, so there is
 * nothing sensible to put in NEXT_PUBLIC_SITE_URL beforehand. Vercel injects
 * `VERCEL_PROJECT_PRODUCTION_URL` (the production domain, no protocol) at build
 * time, so the first deploy already emits correct metadata. Set
 * NEXT_PUBLIC_SITE_URL once you have a custom domain — it always wins.
 *
 * NOTE: `VERCEL_PROJECT_PRODUCTION_URL` is not a NEXT_PUBLIC_ var, so it inlines
 * as undefined in client bundles. That is fine today because SITE_URL is only
 * read on the server; if you ever need it in a client component, set
 * NEXT_PUBLIC_SITE_URL explicitly.
 */
const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelProductionUrl ? `https://${vercelProductionUrl}` : '') ||
  'http://localhost:3000'
).replace(/\/$/, '');

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
