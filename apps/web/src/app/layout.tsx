import type { Metadata, Viewport } from 'next';
import { outfit, jetbrainsMono } from '@/lib/fonts';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { SITE_URL } from '@/lib/utils';
import { getSettings } from '@/lib/site';
import '@/styles/globals.css';

/** Site-wide metadata, seeded from CMS settings with sensible defaults. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.metaTitle ?? `${settings.siteName} — Careers & Culture`;
  const description =
    settings.metaDescription ??
    settings.description ??
    'Explore careers, culture and life at RFT360.';
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s — ${settings.siteName}` },
    description,
    keywords: settings.metaKeywords ?? undefined,
    openGraph: { title, description, siteName: settings.siteName, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0b09' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Font Awesome for the icon strings stored in CMS content. */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
