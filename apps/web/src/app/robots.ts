import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';

/** Allows crawling of the public site; blocks the admin area and API routes. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/login', '/styleguide'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
