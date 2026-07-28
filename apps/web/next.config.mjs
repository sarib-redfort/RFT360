/**
 * NOTE: the monorepo-root `.env` is injected by `dotenv-cli` in this package's
 * dev/build/start scripts (same pattern the API uses for Prisma). Next only
 * reads env files from its own directory, and loading them here would be too
 * late for the Edge middleware — which needs `AUTH_SECRET` or Auth.js throws
 * `MissingSecret` and CMS login breaks.
 */

/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
// Derive the API host so uploaded media (served from the API origin) is allowed.
let apiHost = 'localhost';
try {
  apiHost = new URL(apiUrl).hostname;
} catch {
  /* keep default */
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@rft360/shared'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: apiHost },
      { protocol: 'https', hostname: apiHost },
      { protocol: 'http', hostname: 'localhost' },
      // Unsplash placeholders used by the styleguide/seed until real media is uploaded.
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    const apiOrigin = (() => {
      try {
        return new URL(apiUrl).origin;
      } catch {
        return 'http://localhost:4000';
      }
    })();

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
      `img-src 'self' data: blob: ${apiOrigin} https://images.unsplash.com https://www.google-analytics.com`,
      `connect-src 'self' ${apiOrigin} https://www.google-analytics.com`,
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
