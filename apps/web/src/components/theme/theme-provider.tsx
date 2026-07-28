'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

/**
 * Wraps next-themes so theme state is available app-wide.
 *
 * Configured to stamp `data-theme="light|dark"` on <html> (which our token
 * overrides key off), default to the signature dark look, and persist the
 * visitor's choice. A blocking inline script from next-themes applies the
 * stored theme before paint, so there is no flash on reload.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
