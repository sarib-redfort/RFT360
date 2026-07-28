import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';
import { getPosts, getJobs, getEvents, getAlbums } from '@/lib/content';

/**
 * Dynamic sitemap: the eight static planner pages plus every published blog
 * post, job, event and gallery album fetched from the API. Regenerates on the
 * same revalidation cadence as the content it lists.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    '',
    '/about-culture',
    '/careers',
    '/life-at-redfort',
    '/events',
    '/gallery',
    '/blogs',
    '/contact',
  ];

  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  // Fetch dynamic content; degrade gracefully if the API is unavailable.
  const [posts, jobs, events, albums] = await Promise.all([
    getPosts({ limit: '100' }).catch(() => ({ data: [] })),
    getJobs({ limit: '100' }).catch(() => ({ data: [] })),
    getEvents().catch(() => ({ data: [] })),
    getAlbums().catch(() => ({ data: [] })),
  ]);

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...posts.data.map((p) => ({ url: `${SITE_URL}/blogs/${p.slug}`, lastModified: now, priority: 0.6 })),
    ...jobs.data.map((j) => ({ url: `${SITE_URL}/careers/${j.slug}`, lastModified: now, priority: 0.6 })),
    ...events.data.map((e) => ({ url: `${SITE_URL}/events/${e.slug}`, lastModified: now, priority: 0.5 })),
    ...albums.data.map((a) => ({ url: `${SITE_URL}/gallery/${a.slug}`, lastModified: now, priority: 0.4 })),
  ];

  return [...staticEntries, ...dynamicEntries];
}
