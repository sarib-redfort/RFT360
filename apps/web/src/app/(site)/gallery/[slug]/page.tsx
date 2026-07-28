import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/primitives';
import { LightboxGallery } from '@/components/gallery/lightbox-gallery';
import { getAlbum } from '@/lib/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) return { title: 'Album not found' };
  return {
    title: album.title,
    description: album.description ?? undefined,
    alternates: { canonical: `/gallery/${slug}` },
  };
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) notFound();

  return (
    <section className="bg-[var(--bg-dark)] pb-24 pt-36 md:pt-44">
      <Container>
        <Link href="/gallery" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          ← All albums
        </Link>
        <h1 className="display-md mt-4">{album.title}</h1>
        {album.description && (
          <p className="mt-3 max-w-2xl text-lg text-[var(--text-secondary)]">{album.description}</p>
        )}
        <div className="mt-10">
          {album.images && album.images.length > 0 ? (
            <LightboxGallery images={album.images} />
          ) : (
            <p className="text-[var(--text-secondary)]">This album has no photos yet.</p>
          )}
        </div>
      </Container>
    </section>
  );
}
