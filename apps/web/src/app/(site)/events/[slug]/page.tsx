import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Icon } from '@/components/ui/primitives';
import { getEvent } from '@/lib/content';
import { formatDate, mediaSrc } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: 'Event not found' };
  return {
    title: event.title,
    description: event.summary ?? undefined,
    alternates: { canonical: `/events/${slug}` },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const cover = mediaSrc(event.coverImage, 'large');

  return (
    <article className="bg-[var(--bg-dark)] pb-24 pt-36 md:pt-44">
      <Container size="narrow">
        <Link href="/events" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          ← All events
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-2">
            <Icon name="fa-solid fa-calendar" className="text-[var(--accent)]" />
            {formatDate(event.startsAt)}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-2">
              <Icon name="fa-solid fa-location-dot" className="text-[var(--accent)]" />
              {event.location}
            </span>
          )}
        </div>
        <h1 className="display-md mt-3">{event.title}</h1>
        {event.summary && <p className="mt-4 text-lg text-[var(--text-secondary)]">{event.summary}</p>}
      </Container>

      {cover && (
        <Container className="mt-10">
          <div className="relative aspect-[16/8] overflow-hidden rounded-3xl border border-[var(--border)]">
            <Image src={cover} alt={event.title} fill sizes="100vw" className="object-cover" priority />
          </div>
        </Container>
      )}

      {event.descriptionHtml && (
        <Container size="narrow" className="mt-12">
          <div className="prose-rft" dangerouslySetInnerHTML={{ __html: event.descriptionHtml }} />
        </Container>
      )}
    </article>
  );
}
