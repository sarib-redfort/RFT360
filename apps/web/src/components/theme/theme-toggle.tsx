'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

/**
 * Header control that flips between light and dark. Renders a stable placeholder
 * until mounted to avoid a hydration mismatch (the server can't know the stored
 * theme). Sun/moon icons are inline SVG — no icon dependency.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      /*
       * Gated on `mounted` like the icon below. The server cannot know the
       * stored theme, so `resolvedTheme` is undefined there and `isDark` is
       * false — rendering "Switch to dark theme" on the server and
       * "Switch to light theme" on the client, which React reports as a
       * hydration mismatch and refuses to patch up.
       */
      aria-label={
        !mounted ? 'Toggle theme' : isDark ? 'Switch to light theme' : 'Switch to dark theme'
      }
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`tap-target inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-accent)] hover:text-[var(--text-primary)] ${className}`}
    >
      {!mounted ? (
        <span className="h-4 w-4" />
      ) : isDark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
