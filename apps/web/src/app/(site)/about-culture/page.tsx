import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/reveal';
import { StatCounter } from '@/components/ui/stat-counter';
import { FeatureCard, TeamCard } from '@/components/cards';
import { getPage, getStatistics, getTeam, getValues } from '@/lib/content';
import { metaFromPage } from '@/lib/page-meta';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('about-culture');
  return metaFromPage(page, {
    title: 'About Culture',
    description: 'The values and culture that define RFT360.',
    path: '/about-culture',
  });
}

/** About Culture — mission, values, stats and leadership. */
export default async function AboutCulturePage() {
  const [page, values, stats, team] = await Promise.all([
    getPage('about-culture'),
    getValues(),
    getStatistics(),
    getTeam(),
  ]);
  const leadership = team.filter((m) => m.isLeadership);

  return (
    <>
      <PageHero
        eyebrow={page?.eyebrow ?? 'Who we are'}
        heading={page?.heading ?? 'A culture built around'}
        accent={page?.headingAccent}
        subheading={
          page?.subheading ??
          'At RedFort, our culture is not a poster on the wall — it is how we work, grow and win together every day.'
        }
        image={page?.heroImage}
      />

      {stats.length > 0 && (
        <Section tone="surface" topRule="accent">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.id} delay={(i % 4) * 0.08} className="text-center">
                <div className="font-[var(--font-heading)] text-[clamp(2.5rem,5vw,3.5rem)] font-extrabold text-[var(--text-primary)]">
                  <StatCounter value={stat.value} />
                </div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {stat.label}
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {values.length > 0 && (
        <Section topRule="muted" glow>
          <SectionHeading
            eyebrow="Our values"
            heading="What we"
            accent="stand for"
            lede="The principles that guide how we work and treat each other."
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value, i) => (
              <Reveal key={value.id} direction="scale" delay={(i % 3) * 0.08}>
                <FeatureCard item={value} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {leadership.length > 0 && (
        <Section tone="surface" topRule="accent">
          <SectionHeading
            eyebrow="Leadership"
            heading="Meet the people"
            accent="leading RedFort"
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {leadership.map((member, i) => (
              <Reveal key={member.id} delay={(i % 4) * 0.08}>
                <TeamCard member={member} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
