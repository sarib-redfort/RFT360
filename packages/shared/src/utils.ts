/** Small pure helpers needed by both apps. */

/**
 * Converts arbitrary text into a URL-safe slug matching `slugSchema`.
 * Diacritics are stripped so "Café Life" becomes "cafe-life".
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD') // decompose accents so the filter below drops them
    .replace(/[̀-ͯ]/g, '') // strip combining accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
}

/** Average adult reading speed, used to estimate blog reading time. */
const WORDS_PER_MINUTE = 200;

/** Estimates reading time in whole minutes (minimum 1) from an HTML string. */
export function calculateReadingMinutes(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 1;
  const words = text.split(' ').length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Truncates at a word boundary and appends an ellipsis when shortened. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

/** Derives a plain-text excerpt from rendered HTML. */
export function excerptFromHtml(html: string, maxLength = 200): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return truncate(text, maxLength);
}

/** Formats a salary band for display, honouring an absent upper or lower bound. */
export function formatSalaryRange(
  min: number | null | undefined,
  max: number | null | undefined,
  currency = 'PKR',
): string | null {
  if (min == null && max == null) return null;
  const format = (value: number) => new Intl.NumberFormat('en-US').format(value);
  if (min != null && max != null) return `${currency} ${format(min)} – ${format(max)}`;
  if (min != null) return `${currency} ${format(min)}+`;
  return `Up to ${currency} ${format(max as number)}`;
}

/** Turns `FULL_TIME` into `Full Time` for display. */
export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Builds pagination metadata for a list response. */
export function buildPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
