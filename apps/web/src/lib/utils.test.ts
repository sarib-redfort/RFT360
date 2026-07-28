import { describe, it, expect } from 'vitest';
import { cn, mediaSrc, formatDate, absoluteUrl } from './utils';

describe('cn', () => {
  it('joins truthy class values and drops falsy ones', () => {
    expect(cn('a', false, 'b', undefined, 'c')).toBe('a b c');
  });
});

describe('mediaSrc', () => {
  it('returns null for missing media', () => {
    expect(mediaSrc(null)).toBeNull();
    expect(mediaSrc(undefined)).toBeNull();
  });

  it('prefers the requested variant URL', () => {
    const media = { variants: { medium: { url: 'http://x/medium.webp' } } };
    expect(mediaSrc(media, 'medium')).toBe('http://x/medium.webp');
  });

  it('falls back to the original storage key when no variant exists', () => {
    const media = { storageKey: 'uploads/abc/original.webp' };
    expect(mediaSrc(media, 'large')).toContain('uploads/abc/original.webp');
  });
});

describe('formatDate', () => {
  it('formats an ISO string as a readable date', () => {
    expect(formatDate('2026-07-25T00:00:00.000Z')).toMatch(/2026/);
  });
  it('returns empty string for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('');
    expect(formatDate(null)).toBe('');
  });
});

describe('absoluteUrl', () => {
  it('prefixes a path with the site URL', () => {
    expect(absoluteUrl('/blogs/x')).toMatch(/\/blogs\/x$/);
  });
});
