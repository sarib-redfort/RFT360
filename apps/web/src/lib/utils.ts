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

/** Absolute site URL for canonical/OG tags. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
