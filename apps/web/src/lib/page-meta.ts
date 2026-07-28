import type { Metadata } from 'next';
import type { PageDetail } from './content-types';

/** Builds Next metadata from a CMS page record, with sensible fallbacks. */
export function metaFromPage(
  page: PageDetail | null,
  fallback: { title: string; description: string; path: string },
): Metadata {
  const title = page?.metaTitle ?? page?.title ?? fallback.title;
  const description = page?.metaDescription ?? page?.subheading ?? fallback.description;
  return {
    title,
    description,
    alternates: { canonical: fallback.path },
    openGraph: { title, description, url: fallback.path, type: 'website' },
  };
}
