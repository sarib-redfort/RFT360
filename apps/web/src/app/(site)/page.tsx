import { CACHE_TAGS } from '@rft360/shared';
import { apiGet } from '@/lib/api';
import { getStatistics } from '@/lib/content';
import type { HomepageComposite } from '@/lib/content-types';
import { SectionRenderer } from '@/components/sections/section-renderer';
import { HomeFallback } from '@/components/sections/home-fallback';
import { OrganizationJsonLd } from '@/components/seo/json-ld';

/**
 * The homepage.
 *
 * Renders the planner's section flow from the CMS composite endpoint, in the
 * order and visibility the editor configured. Statistics are fetched alongside
 * so the hero can show the original's inline stat row. Cached under the
 * `homepage` tag and revalidated on publish.
 */
export default async function HomePage() {
  const [composite, stats] = await Promise.all([
    apiGet<HomepageComposite>('/homepage', { tags: [CACHE_TAGS.homepage] }),
    getStatistics().catch(() => []),
  ]);

  const sections = composite?.sections ?? [];

  return (
    <>
      <OrganizationJsonLd />
      {sections.length > 0 ? (
        sections.map((section) => (
          <SectionRenderer key={section.id} section={section} stats={stats} />
        ))
      ) : (
        // Shown only when the API is unreachable/unseeded, so the site never 500s.
        <HomeFallback />
      )}
    </>
  );
}
