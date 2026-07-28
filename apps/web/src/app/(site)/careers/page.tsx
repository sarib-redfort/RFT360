import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/layout/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/reveal';
import { FeatureCard, JobCard } from '@/components/cards';
import { getDepartments, getJobs, getPage, getPerks } from '@/lib/content';
import { metaFromPage } from '@/lib/page-meta';
import type { JobItem } from '@/lib/content-types';
import { cn } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('careers');
  return metaFromPage(page, {
    title: 'Careers',
    description: 'Explore open roles and build your career at RedFort.',
    path: '/careers',
  });
}

interface Department {
  id: string;
  name: string;
  slug: string;
}

/** Careers — filterable openings list plus a perks reminder. */
export default async function CareersPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string }>;
}) {
  const { department } = await searchParams;
  const [page, jobsResult, departments, perks] = await Promise.all([
    getPage('careers'),
    getJobs(department ? { department, limit: '100' } : { limit: '100' }),
    getDepartments() as Promise<Department[]>,
    getPerks(),
  ]);

  const jobs = jobsResult.data as JobItem[];

  return (
    <>
      <PageHero
        eyebrow={page?.eyebrow ?? 'Join the team'}
        heading={page?.heading ?? 'Build your career'}
        accent={page?.headingAccent}
        subheading={
          page?.subheading ??
          'Work on hard problems with brilliant people, and grow faster than you thought possible.'
        }
        image={page?.heroImage}
      />

      <Section topRule="accent" glow>
        <SectionHeading eyebrow="Open positions" heading="Current" accent="openings" />

        {/* Department filter */}
        {departments.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <FilterChip href="/careers" active={!department} label="All" />
            {departments.map((dept) => (
              <FilterChip
                key={dept.id}
                href={`/careers?department=${dept.slug}`}
                active={department === dept.slug}
                label={dept.name}
              />
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {jobs.length > 0 ? (
            jobs.map((job, i) => (
              <Reveal key={job.id} delay={(i % 6) * 0.05}>
                <JobCard job={job} />
              </Reveal>
            ))
          ) : (
            <p className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center text-[var(--text-secondary)]">
              No open roles in this area right now — check back soon, or{' '}
              <Link href="/contact" className="text-[var(--accent)]">
                get in touch
              </Link>
              .
            </p>
          )}
        </div>
      </Section>

      {perks.length > 0 && (
        <Section tone="surface" topRule="muted">
          <SectionHeading eyebrow="Why join" heading="What you" accent="get" align="center" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perks.slice(0, 6).map((perk, i) => (
              <Reveal key={perk.id} direction="scale" delay={(i % 3) * 0.08}>
                <FeatureCard item={perk} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'tap-target inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-[var(--border-accent)] bg-[var(--accent-subtle)] text-[var(--accent)]'
          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-accent)] hover:text-[var(--text-primary)]',
      )}
    >
      {label}
    </Link>
  );
}
