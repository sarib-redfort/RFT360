import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PageHero } from '@/components/layout/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/reveal';
import { FeatureCard, TestimonialCard } from '@/components/cards';
import { getAlbums, getPage, getPerks, getTestimonials } from '@/lib/content';
import { metaFromPage } from '@/lib/page-meta';
import { mediaSrc } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('life-at-redfort');
  return metaFromPage(page, {
    title: 'Life at RedFort',
    description: 'The people, perks and everyday moments that make RedFort more than a workplace.',
    path: '/life-at-redfort',
  });
}

/** Life at RedFort — perks, a gallery peek and employee voices. */
export default async function LifeAtRedfortPage() {
  const [page, perks, testimonials, albums] = await Promise.all([
    getPage('life-at-redfort'),
    getPerks(),
    getTestimonials(),
    getAlbums(),
  ]);

  const previewImages = albums.data
    .flatMap((album) => album.images ?? [])
    .slice(0, 6);

  return (
    <>
      <PageHero
        eyebrow={page?.eyebrow ?? 'Life here'}
        heading={page?.heading ?? 'More than'}
        accent={page?.headingAccent}
        subheading={
          page?.subheading ??
          'Discover what it is really like to work at RedFort — the people, the perks, the growth and the everyday moments.'
        }
        image={page?.heroImage}
      />

      {perks.length > 0 && (
        <Section tone="surface" topRule="accent" glow>
          <SectionHeading
            eyebrow="Benefits"
            heading="What you"
            accent="get"
            lede="We invest in our people the way great companies invest in their products."
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((perk, i) => (
              <Reveal key={perk.id} direction="scale" delay={(i % 3) * 0.08}>
                <FeatureCard item={perk} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {previewImages.length > 0 && (
        <Section topRule="muted">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="In pictures" heading="Moments" accent="at RedFort" />
            <Link href="/gallery" className="text-sm font-semibold text-[var(--accent)]">
              View gallery →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
            {previewImages.map((img) => {
              const src = mediaSrc(img.media, 'medium');
              return (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]"
                >
                  {src && (
                    <Image
                      src={src}
                      alt={img.caption ?? 'Life at RedFort'}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {testimonials.length > 0 && (
        <Section tone="surface" topRule="accent" glow>
          <SectionHeading
            eyebrow="In their words"
            heading="What our people"
            accent="say"
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.id} delay={(i % 3) * 0.08}>
                <TestimonialCard testimonial={t} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
