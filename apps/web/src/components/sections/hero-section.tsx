import Image from 'next/image';
import { Container, GlowOrb, ScrollIndicator } from '@/components/ui/primitives';
import { ButtonLink, ArrowIcon } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { StatCounter } from '@/components/ui/stat-counter';
import { Terminal } from '@/components/ui/terminal';
import { mediaSrc } from '@/lib/utils';
import type { HomepageSection, StatItem } from '@/lib/content-types';

/**
 * Homepage hero — the original composition, kept deliberately quiet.
 *
 * Left column: stamp, oversized headline with a red-gradient second line, one
 * short line of copy, two CTAs, and a hairline-separated stat row. Right column:
 * a single panel (CMS image, else the animated terminal) with the live badge
 * beneath. Nothing else — no floating cards, no ticker. The restraint is the
 * point: one focal headline, one panel, one row of proof.
 *
 * Motion is limited to the entrance reveals, the slow panel float, the headline
 * shimmer and the stat count-up, so the eye lands on the headline first.
 */
export function HeroSection({
  section,
  stats = [],
}: {
  section: HomepageSection;
  stats?: StatItem[];
}) {
  const image = mediaSrc(section.image, 'large');
  // Three reads cleaner than four and keeps the row on one line at every width.
  const heroStats = stats.slice(0, 3);

  return (
    <section
      id="hero"
      data-label="Home"
      className="scroll-section relative bg-[var(--bg-dark)]"
    >
      {/* Ambient wash — soft elliptical falloff, no hard edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(115% 85% at 100% 10%, rgba(222,24,27,0.09) 0%, rgba(222,24,27,0.03) 40%, transparent 74%)',
        }}
      />
      <GlowOrb className="h-[640px] w-[640px]" style={{ top: -120, right: -160 }} />

      <Container className="relative z-[1]">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] xl:gap-24">
          {/* ── Left ─────────────────────────────────────────────── */}
          <div className="w-full">
            {section.eyebrow && (
              <Reveal>
                <div className="hero-stamp mb-10">
                  <div className="hero-stamp-line" />
                  <span className="hero-stamp-text">{section.eyebrow}</span>
                </div>
              </Reveal>
            )}

            <Reveal delay={0.08}>
              <h1 className="text-[clamp(3rem,5.4vw,6rem)] font-black leading-[0.94] tracking-[-3px]">
                <span className="block text-white-grad">{section.heading}</span>
                {section.headingAccent && (
                  <span className="text-accent-grad shimmer block">{section.headingAccent}</span>
                )}
              </h1>
            </Reveal>

            {section.subheading && (
              <Reveal delay={0.16}>
                <p className="mt-8 max-w-[30rem] text-[1.05rem] leading-[1.75] text-[var(--text-secondary)]">
                  {section.subheading}
                </p>
              </Reveal>
            )}

            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                {section.ctaPrimary && (
                  <ButtonLink href={section.ctaPrimary.href} size="lg">
                    {section.ctaPrimary.label} &nbsp;
                    <ArrowIcon />
                  </ButtonLink>
                )}
                {section.ctaSecondary && (
                  <ButtonLink href={section.ctaSecondary.href} variant="outline" size="lg">
                    {section.ctaSecondary.label}
                  </ButtonLink>
                )}
              </div>
            </Reveal>

            {heroStats.length > 0 && (
              <Reveal delay={0.32}>
                <div className="mt-14 flex flex-wrap gap-x-12 gap-y-6 border-t border-[var(--border)] pt-8">
                  {heroStats.map((stat) => (
                    <div key={stat.id}>
                      <div className="hero-stat-val">
                        <StatCounter value={stat.value} />
                      </div>
                      <div className="hero-stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          {/* ── Right: single panel ──────────────────────────────── */}
          <Reveal direction="right" delay={0.16} className="hidden w-full lg:block">
            <div className="float-slow">
              {image ? (
                <div className="panel-glow relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--border)] shadow-[0_50px_120px_rgba(0,0,0,0.8)]">
                  <Image
                    src={image}
                    alt={section.image?.alt ?? 'Life at RFT360'}
                    fill
                    priority
                    sizes="(max-width: 1024px) 0px, 46vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="panel-glow relative rounded-xl">
                  <Terminal />
                </div>
              )}
            </div>

            <div className="live-badge mt-8">
              <div className="live-dot" />
              Actively hiring
            </div>
          </Reveal>
        </div>
      </Container>

      <ScrollIndicator />
    </section>
  );
}
