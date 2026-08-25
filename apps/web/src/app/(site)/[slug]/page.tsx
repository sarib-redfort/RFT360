import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/primitives';
import { PageHero } from '@/components/layout/page-hero';
import { Reveal } from '@/components/ui/reveal';
import { getPage } from '@/lib/content';

/**
 * Catch-all route for CMS-managed pages.
 *
 * Purpose-built routes (`/careers`, `/blogs`, …) are static segments and always
 * win over this one, so it only handles pages that exist solely as CMS records —
 * Privacy Policy and Terms, and anything an editor adds later. Without it those
 * links 404 even though the content is in the database.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? page.subheading ?? undefined,
  };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading ?? page.title}
        accent={page.headingAccent}
        subheading={page.subheading}
        image={page.heroImage}
      />
      {page.bodyHtml && (
        <section className="scroll-section min-h-0 py-20">
          <Container size="narrow">
            <Reveal>
              <div className="prose-rft" dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
            </Reveal>
          </Container>
        </section>
      )}
    </>
  );
}
