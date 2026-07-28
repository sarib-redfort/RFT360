import { Outfit, JetBrains_Mono } from 'next/font/google';

/**
 * Typefaces, matching the original static design exactly.
 *
 * Outfit carries headings AND body (it supports weight 900, which the display
 * headings rely on); JetBrains Mono is used for the terminal, progress values
 * and the numeric/tech accents. Exposed as CSS variables consumed by
 * `globals.css`.
 */
export const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  // Not `--font-mono`: that name is reserved by Tailwind's own theme tokens.
  variable: '--font-mono-jb',
  display: 'swap',
});
