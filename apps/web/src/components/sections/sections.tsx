import Image from 'next/image';
import { Section } from '@/components/ui/section';
import { Eyebrow, Icon, SectionHeading } from '@/components/ui/primitives';
import { mediaSrc } from '@/lib/utils';
import { Reveal } from '@/components/ui/reveal';
import { ButtonLink, ArrowIcon } from '@/components/ui/button';
import { StatCounter } from '@/components/ui/stat-counter';
import { ProgressBars } from '@/components/ui/progress-bars';
import { FaqAccordion } from '@/components/ui/accordion';
import { ContactForm } from '@/components/forms/contact-form';
import {
  CaseStudyCard,
  FeatureCard,
  IndustryTile,
  PostCard,
  ServiceCard,
  TeamCard,
  TestimonialCard,
} from '@/components/cards';
import type {
  AwardItem,
  CaseStudyItem,
  CertificationItem,
  FaqItem,
  HomepageSection,
  IndustryItem,
  LogoItem,
  PerkItem,
  PostItem,
  ServiceItem,
  StatItem,
  TeamMemberItem,
  TestimonialItem,
  ValueItem,
} from '@/lib/content-types';

/*
 * Homepage section bodies. Layouts, column counts and header arrangements are
 * ported from the original static pages; content comes from the CMS.
 */

/**
 * Split header used by several sections in the original: eyebrow + display
 * heading on the left, a right-aligned lede or action on the right.
 */
function SplitHeader({
  eyebrow,
  heading,
  accent,
  lede,
  action,
}: {
  eyebrow?: string | null;
  heading?: string | null;
  accent?: string | null;
  lede?: string | null;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
      <div>
        {eyebrow && (
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
        )}
        <Reveal delay={0.08}>
          <h2 className="display-lg">
            {heading} {accent && <span className="text-accent-grad">{accent}</span>}
          </h2>
        </Reveal>
      </div>
      {lede && (
        <Reveal delay={0.16}>
          <p className="body-text max-w-[360px] md:text-right">{lede}</p>
        </Reveal>
      )}
      {action && (
        <Reveal delay={0.16}>
          <div className="whitespace-nowrap">{action}</div>
        </Reveal>
      )}
    </div>
  );
}

/**
 * Who We Are — copy on the left, a CMS image on the right (mirrors the
 * original's "growth" split, complete with the floating stat card). Falls back
 * to a text-only two-column layout when no image is set.
 */
export function WhoWeAreSection({ section }: { section: HomepageSection }) {
  const image = mediaSrc(section.image, 'large');

  return (
    <Section
      label={section.name}
      tone="surface"
      topRule="muted"
      glow
      glowStyle={{ left: -120, bottom: -60, width: 460, height: 460 }}
    >
      <div className="grid-2">
        <div>
          {section.eyebrow && (
            <Reveal>
              <Eyebrow>{section.eyebrow}</Eyebrow>
            </Reveal>
          )}
          <Reveal delay={0.08}>
            <h2 className="display-lg">
              {section.heading}
              {section.headingAccent && (
                <>
                  <br />
                  <span className="text-accent-grad">{section.headingAccent}</span>
                </>
              )}
            </h2>
          </Reveal>
          {section.subheading && (
            <Reveal delay={0.16}>
              <p className="body-text mt-6">{section.subheading}</p>
            </Reveal>
          )}
          {section.bodyHtml && (
            <Reveal delay={0.24}>
              <div
                className="prose-rft mt-4"
                dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
              />
            </Reveal>
          )}
          {section.ctaPrimary && (
            <Reveal delay={0.32}>
              <div className="mt-8">
                <ButtonLink href={section.ctaPrimary.href} variant="outline">
                  {section.ctaPrimary.label} &nbsp;
                  <ArrowIcon />
                </ButtonLink>
              </div>
            </Reveal>
          )}
        </div>

        {image && (
          <Reveal direction="right" delay={0.16}>
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)]">
                <Image
                  src={image}
                  alt={section.image?.alt ?? section.heading ?? 'Life at RedFort'}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover"
                  style={{ filter: 'saturate(0.72) brightness(0.9) contrast(1.04)' }}
                />
              </div>
              {/* Floating card — ports `.growth-float-card`. */}
              <div className="absolute -bottom-5 -right-4 hidden items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(222,24,27,0.1)] text-[var(--accent)]">
                  <Icon name="fa-solid fa-people-group" className="text-[0.9rem]" />
                </span>
                <span>
                  <strong className="block text-[0.875rem] font-extrabold text-[var(--text-primary)]">
                    One team, one standard
                  </strong>
                  <span className="text-[0.72rem] text-[var(--text-secondary)]">
                    Across every RedFort division
                  </span>
                </span>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </Section>
  );
}

/** Services / "What our teams do" — 3-col hairline grid. */
export function ServicesSection({ section }: { section: HomepageSection }) {
  const items = (section.data as ServiceItem[]) ?? [];
  return (
    <Section label={section.name} topRule="accent" glow glowStyle={{ top: 0, left: '50%', transform: 'translateX(-50%)', width: 800, height: 400 }}>
      <SplitHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        accent={section.headingAccent}
        action={
          <ButtonLink href="/about-culture" variant="outline">
            About Our Culture
          </ButtonLink>
        }
      />
      <Reveal delay={0.16} className="mt-10">
        <div className="hairline-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/** Industries — 6-col hairline grid + credentials row, as in the original. */
export function IndustriesSection({ section }: { section: HomepageSection }) {
  const items = (section.data as IndustryItem[]) ?? [];
  const creds = (section.settings?.credentials as string[] | undefined) ?? [];
  return (
    <Section label={section.name} topRule="accent" glow glowStyle={{ bottom: -100, right: -100, width: 600, height: 500 }}>
      <SplitHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        accent={section.headingAccent}
        lede={section.subheading}
      />
      <Reveal delay={0.16} className="mt-10">
        <div className="hairline-grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((industry) => (
            <IndustryTile key={industry.id} industry={industry} />
          ))}
        </div>
      </Reveal>
      {creds.length > 0 && (
        <Reveal delay={0.32}>
          <div className="cred-row">
            {creds.map((cred) => (
              <div className="cred-item" key={cred}>
                <Icon name="fa-solid fa-circle-check" /> {cred}
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </Section>
  );
}

/**
 * Why Choose Us — ports the original "growth" section: heading + progress bars
 * on the left, the perk/value grid on the right.
 */
export function WhyChooseUsSection({ section }: { section: HomepageSection }) {
  const items = (section.data as (PerkItem | ValueItem)[]) ?? [];
  const metrics =
    (section.settings?.metrics as { label: string; value: string }[] | undefined) ?? [];

  return (
    <Section label={section.name} tone="surface" topRule="muted" glow glowStyle={{ right: -100, top: '50%', transform: 'translateY(-50%)', width: 500, height: 500 }}>
      {metrics.length > 0 ? (
        <div className="grid-2">
          <div>
            {section.eyebrow && (
              <Reveal>
                <Eyebrow>{section.eyebrow}</Eyebrow>
              </Reveal>
            )}
            <Reveal delay={0.08}>
              <h2 className="display-lg">
                {section.heading}
                {section.headingAccent && (
                  <>
                    <br />
                    <span className="text-accent-grad">{section.headingAccent}</span>
                  </>
                )}
              </h2>
            </Reveal>
            {section.subheading && (
              <Reveal delay={0.16}>
                <p className="body-text mt-5">{section.subheading}</p>
              </Reveal>
            )}
            <Reveal delay={0.24} className="mt-10">
              <ProgressBars items={metrics} />
            </Reveal>
          </div>
          <Reveal direction="right" delay={0.16}>
            <div className="hairline-grid grid-cols-1 sm:grid-cols-2">
              {items.slice(0, 4).map((item) => (
                <FeatureCard key={item.id} item={item} />
              ))}
            </div>
          </Reveal>
        </div>
      ) : (
        <>
          <SectionHeading
            eyebrow={section.eyebrow ?? undefined}
            heading={section.heading ?? ''}
            accent={section.headingAccent ?? undefined}
            lede={section.subheading ?? undefined}
            align="center"
          />
          <Reveal delay={0.16} className="mt-10">
            <div className="hairline-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <FeatureCard key={item.id} item={item} />
              ))}
            </div>
          </Reveal>
        </>
      )}
    </Section>
  );
}

export function CaseStudiesSection({ section }: { section: HomepageSection }) {
  const items = (section.data as CaseStudyItem[]) ?? [];
  return (
    <Section label={section.name} topRule="accent" glow>
      <SplitHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        accent={section.headingAccent}
        lede={section.subheading}
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((cs, i) => (
          <Reveal key={cs.id} direction="scale" delay={(i % 3) * 0.08}>
            <CaseStudyCard caseStudy={cs} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function TestimonialsSection({ section }: { section: HomepageSection }) {
  const items = (section.data as TestimonialItem[]) ?? [];
  return (
    <Section label={section.name} tone="surface" topRule="muted" glow>
      <SectionHeading
        eyebrow={section.eyebrow ?? undefined}
        heading={section.heading ?? ''}
        accent={section.headingAccent ?? undefined}
        lede={section.subheading ?? undefined}
        align="center"
      />
      <Reveal delay={0.16} className="mt-10">
        <div className="hairline-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

export function FaqSection({ section }: { section: HomepageSection }) {
  const items = (section.data as FaqItem[]) ?? [];
  return (
    <Section label={section.name} topRule="accent" containerSize="narrow">
      <SectionHeading
        eyebrow={section.eyebrow ?? undefined}
        heading={section.heading ?? ''}
        accent={section.headingAccent ?? undefined}
        lede={section.subheading ?? undefined}
        align="center"
      />
      <Reveal delay={0.16} className="mt-10">
        <FaqAccordion items={items} />
      </Reveal>
    </Section>
  );
}

export function LatestBlogsSection({ section }: { section: HomepageSection }) {
  const items = (section.data as PostItem[]) ?? [];
  return (
    <Section label={section.name} tone="surface" topRule="muted" glow>
      <SplitHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        accent={section.headingAccent}
        action={
          <ButtonLink href="/blogs" variant="outline">
            View All Articles
          </ButtonLink>
        }
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((post, i) => (
          <Reveal key={post.id} delay={(i % 3) * 0.08}>
            <PostCard post={post} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function TeamSection({ section }: { section: HomepageSection }) {
  const items = (section.data as TeamMemberItem[]) ?? [];
  return (
    <Section label={section.name} topRule="muted" glow>
      <SplitHeader
        eyebrow={section.eyebrow}
        heading={section.heading}
        accent={section.headingAccent}
        lede={section.subheading}
      />
      <Reveal delay={0.16} className="mt-10">
        <div className="hairline-grid grid-cols-2 lg:grid-cols-4">
          {items.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

export function StatisticsSection({ section }: { section: HomepageSection }) {
  const items = (section.data as StatItem[]) ?? [];
  return (
    <Section label={section.name} tone="surface" topRule="accent" fullHeight={false}>
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((stat, i) => (
          <Reveal key={stat.id} delay={(i % 4) * 0.08}>
            <div className="stat-number">
              <StatCounter value={stat.value} />
            </div>
            <div className="stat-desc">{stat.label}</div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function LogosSection({ section }: { section: HomepageSection }) {
  const items = (section.data as LogoItem[]) ?? [];
  return (
    <Section label={section.name} tone="surface" fullHeight={false}>
      {section.heading && (
        <p className="text-center text-[0.7rem] font-bold uppercase tracking-[3px] text-[var(--text-muted)]">
          {section.heading}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
        {items.map((logo) => (
          <span key={logo.id} className="text-lg font-bold text-[var(--text-secondary)]">
            {logo.name}
          </span>
        ))}
      </div>
    </Section>
  );
}

export function CertificationsSection({ section }: { section: HomepageSection }) {
  const items = (section.data as CertificationItem[]) ?? [];
  return (
    <Section label={section.name} topRule="muted" fullHeight={false}>
      <SectionHeading
        eyebrow={section.eyebrow ?? undefined}
        heading={section.heading ?? ''}
        accent={section.headingAccent ?? undefined}
        align="center"
      />
      <div className="cred-row justify-center">
        {items.map((cert) => (
          <div className="cred-item" key={cert.id}>
            <Icon name={cert.icon ?? 'fa-solid fa-certificate'} /> {cert.name}
          </div>
        ))}
      </div>
    </Section>
  );
}

export function AwardsSection({ section }: { section: HomepageSection }) {
  const items = (section.data as AwardItem[]) ?? [];
  return (
    <Section label={section.name} tone="surface" topRule="accent">
      <SectionHeading
        eyebrow={section.eyebrow ?? undefined}
        heading={section.heading ?? ''}
        accent={section.headingAccent ?? undefined}
        align="center"
      />
      <Reveal delay={0.16} className="mt-10">
        <div className="hairline-grid grid-cols-1 sm:grid-cols-3">
          {items.map((award) => (
            <div key={award.id} className="grid-cell px-8 py-10 text-center">
              <Icon
                name={award.icon ?? 'fa-solid fa-trophy'}
                className="text-3xl text-[var(--accent)]"
              />
              <h3 className="mt-4 text-base font-bold text-[var(--text-primary)]">{award.title}</h3>
              {award.issuer && (
                <p className="mt-1 text-[0.78rem] text-[var(--text-muted)]">{award.issuer}</p>
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/** Contact — heading + CTA on the left, form on the right (original CTA layout). */
export function ContactFormSection({ section }: { section: HomepageSection }) {
  return (
    <Section label={section.name} topRule="accent" glow glowStyle={{ top: '50%', right: -200, transform: 'translateY(-50%)', width: 700, height: 600 }}>
      <div className="grid items-start gap-16 lg:grid-cols-2">
        <div>
          {section.eyebrow && (
            <Reveal>
              <Eyebrow>{section.eyebrow}</Eyebrow>
            </Reveal>
          )}
          <Reveal delay={0.08}>
            <div className="text-[clamp(3rem,5.5vw,5rem)] font-black leading-[0.9] tracking-[-4px] text-[var(--text-primary)]">
              {section.heading}
              {section.headingAccent && (
                <>
                  <br />
                  <span className="text-accent-grad">{section.headingAccent}</span>
                </>
              )}
            </div>
          </Reveal>
          {section.subheading && (
            <Reveal delay={0.16}>
              <p className="body-text mt-8">{section.subheading}</p>
            </Reveal>
          )}
          {section.ctaPrimary && (
            <Reveal delay={0.24}>
              <div className="mt-8">
                <ButtonLink href={section.ctaPrimary.href} size="lg">
                  {section.ctaPrimary.label} &nbsp;
                  <ArrowIcon />
                </ButtonLink>
              </div>
            </Reveal>
          )}
        </div>
        <Reveal direction="right" delay={0.16}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}

/** Generic rich-text / CTA block. */
export function RichTextSection({ section }: { section: HomepageSection }) {
  return (
    <Section label={section.name} containerSize="narrow">
      <div className="text-center">
        <SectionHeading
          eyebrow={section.eyebrow ?? undefined}
          heading={section.heading ?? ''}
          accent={section.headingAccent ?? undefined}
          lede={section.subheading ?? undefined}
          align="center"
        />
        {section.bodyHtml && (
          <div
            className="prose-rft mt-8 text-left"
            dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
          />
        )}
        <div className="mt-10 flex justify-center gap-4">
          {section.ctaPrimary && (
            <ButtonLink href={section.ctaPrimary.href}>
              {section.ctaPrimary.label} &nbsp;
              <ArrowIcon />
            </ButtonLink>
          )}
          {section.ctaSecondary && (
            <ButtonLink href={section.ctaSecondary.href} variant="outline">
              {section.ctaSecondary.label}
            </ButtonLink>
          )}
        </div>
      </div>
    </Section>
  );
}
