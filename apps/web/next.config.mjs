/**
 * NOTE: the monorepo-root `.env` is injected by `dotenv-cli` in this package's
 * dev/build/start scripts (same pattern the API uses for Prisma). Next only
 * reads env files from its own directory, and loading them here would be too
 * late for the Edge middleware — which needs `AUTH_SECRET` or Auth.js throws
 * `MissingSecret` and CMS login breaks.
 */

/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/** Hostname of a URL, or null when it isn't parseable. */
function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/** Origin of a URL, or null when it isn't parseable. */
function originOf(url) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

const apiHost = hostOf(apiUrl) ?? 'localhost';

/*
 * With STORAGE_DRIVER=s3 the API hands back absolute URLs on the object store's
 * own domain (Cloudflare R2, S3, MinIO) — NOT the API origin. That host has to
 * be allowlisted in BOTH places below or every uploaded image breaks in
 * production: `next/image` refuses to optimise an unlisted hostname, and the CSP
 * blocks the request even if it did. `NEXT_PUBLIC_MEDIA_URL` must match the
 * API's `S3_PUBLIC_URL`.
 */
const mediaHost = hostOf(process.env.NEXT_PUBLIC_MEDIA_URL ?? '');

/*
 * Supabase serves the same public object from two hostnames —
 * `<ref>.supabase.co` and `<ref>.storage.supabase.co` — and either is a valid
 * thing to put in S3_PUBLIC_URL. Whichever one the API was configured with is
 * baked into the absolute URLs already stored on Media rows, so allowing only
 * the currently-configured host breaks previously-uploaded images the moment
 * the setting changes. Allow the sibling host too.
 */
function supabaseSibling(host) {
  if (!host) return null;
  if (host.endsWith('.storage.supabase.co')) return host.replace('.storage.supabase.co', '.supabase.co');
  if (host.endsWith('.supabase.co')) return host.replace('.supabase.co', '.storage.supabase.co');
  return null;
}
const mediaHostSibling = supabaseSibling(mediaHost);

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@rft360/shared'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: apiHost },
      { protocol: 'https', hostname: apiHost },
      { protocol: 'http', hostname: 'localhost' },
      ...(mediaHost ? [{ protocol: 'https', hostname: mediaHost }] : []),
      ...(mediaHostSibling ? [{ protocol: 'https', hostname: mediaHostSibling }] : []),
      // Unsplash placeholders used by the styleguide/seed until real media is uploaded.
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    const apiOrigin = originOf(apiUrl) ?? 'http://localhost:4000';
    const mediaOrigin = originOf(process.env.NEXT_PUBLIC_MEDIA_URL ?? '');
    const mediaOriginSibling = mediaHostSibling ? `https://${mediaHostSibling}` : null;
    // Deduped so a media URL on the API origin doesn't repeat in the directive.
    const imgOrigins = [
      ...new Set([apiOrigin, mediaOrigin, mediaOriginSibling].filter(Boolean)),
    ].join(' ');

    /**
     * Content Security Policy.
     * - 'unsafe-inline' on scripts is required by Next's inline bootstrap and
     *   next-themes' no-flash script; styles use inline for the token system.
     * - connect/img/frame are scoped to self, the API origin and the few
     *   third parties the site legitimately embeds (Font Awesome CDN, maps,
     *   YouTube/Vimeo). Tighten further per deployment as needed.
     */
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
      "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com data:",
      `img-src 'self' data: blob: ${imgOrigins} https://images.unsplash.com https://www.google-analytics.com`,
      `connect-src 'self' ${imgOrigins} https://www.google-analytics.com`,
      "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://www.google.com https://maps.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      'upgrade-insecure-requests',
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
