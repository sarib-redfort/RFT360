import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PageHero } from '@/components/layout/page-hero';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/primitives';
import { getEvents, getPage } from '@/lib/content';
import { metaFromPage } from '@/lib/page-meta';
import { formatDate, mediaSrc } from '@/lib/utils';
import type { EventItem } from '@/lib/content-types';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('events');
  return metaFromPage(page, {
    title: 'Events',
    description: 'Hackathons, talks and celebrations at RedFort.',
    path: '/events',
  });
}

/** Events — upcoming and past, split for scannability. */
export default async function EventsPage() {
  const [page, result] = await Promise.all([getPage('events'), getEvents()]);
  const events = result.data;
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.startsAt).getTime() >= now);
  const past = events.filter((e) => new Date(e.startsAt).getTime() < now);

  return (
    <>
      <PageHero
        eyebrow={page?.eyebrow ?? 'What’s happening'}
        heading={page?.heading ?? 'Events at'}
        accent={page?.headingAccent}
        subheading={
          page?.subheading ??
          'From hackathons to family days, our events bring people together and make RedFort more than just a company.'
        }
        image={page?.heroImage}
      />

      {upcoming.length > 0 && (
        <Section topRule="accent" glow>
          <h2 className="display-md">Upcoming</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {upcoming.map((event, i) => (
              <Reveal key={event.id} delay={(i % 2) * 0.08}>
                <EventCard event={event} highlight />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {past.length > 0 && (
        <Section tone="surface" topRule="muted">
          <h2 className="display-md">Past events</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {past.map((event, i) => (
              <Reveal key={event.id} delay={(i % 3) * 0.06}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {events.length === 0 && (
        <Section>
          <p className="text-center text-[var(--text-secondary)]">No events published yet.</p>
        </Section>
      )}
    </>
  );
}

function EventCard({ event, highlight }: { event: EventItem; highlight?: boolean }) {
  const cover = mediaSrc(event.coverImage, 'medium');
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--border-accent)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--bg-surface)]">
        {cover ? (
          <Image src={cover} alt={event.title} fill sizes="50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
            <Icon name="fa-solid fa-calendar-days" className="text-3xl" />
          </div>
        )}
        {highlight && (
          <span className="absolute left-4 top-4 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white">
            Upcoming
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="fa-solid fa-calendar" className="text-[var(--accent)]" />
            {formatDate(event.startsAt)}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="fa-solid fa-location-dot" className="text-[var(--accent)]" />
              {event.location}
            </span>
          )}
        </div>
        <h3 className="mt-3 font-[var(--font-heading)] text-lg font-semibold text-[var(--text-primary)]">
          {event.title}
        </h3>
        {event.summary && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-[var(--text-secondary)]">{event.summary}</p>
        )}
      </div>
    </Link>
  );
}
