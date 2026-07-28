import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PageHero } from '@/components/layout/page-hero';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/primitives';
import { getAlbums, getPage } from '@/lib/content';
import { metaFromPage } from '@/lib/page-meta';
import { formatDate, mediaSrc } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('gallery');
  return metaFromPage(page, {
    title: 'Gallery',
    description: 'A visual journey through life, work and celebration at RedFort.',
    path: '/gallery',
  });
}

/** Gallery index — albums as cover cards linking to each album's lightbox. */
export default async function GalleryPage() {
  const [page, result] = await Promise.all([getPage('gallery'), getAlbums()]);
  const albums = result.data;

  return (
    <>
      <PageHero
        eyebrow={page?.eyebrow ?? 'In pictures'}
        heading={page?.heading ?? 'Moments at'}
        accent={page?.headingAccent}
        subheading={page?.subheading ?? 'A visual journey through life, work and celebration at RedFort.'}
        image={page?.heroImage}
      />

      <Section topRule="accent" glow>
        {albums.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album, i) => {
              const cover = mediaSrc(album.coverImage ?? album.images?.[0]?.media, 'medium');
              return (
                <Reveal key={album.id} delay={(i % 3) * 0.08}>
                  <Link
                    href={`/gallery/${album.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--border-accent)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-surface)]">
                      {cover ? (
                        <Image src={cover} alt={album.title} fill sizes="33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                          <Icon name="fa-regular fa-images" className="text-3xl" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-[var(--font-heading)] text-lg font-semibold text-[var(--text-primary)]">
                        {album.title}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {album.images?.length ?? 0} photos
                        {album.takenAt ? ` · ${formatDate(album.takenAt)}` : ''}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-[var(--text-secondary)]">No albums published yet.</p>
        )}
      </Section>
    </>
  );
}
