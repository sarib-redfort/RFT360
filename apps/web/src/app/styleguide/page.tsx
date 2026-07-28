import type { Metadata } from 'next';
import { ButtonLink, ArrowIcon } from '@/components/ui/button';
import { Container, Eyebrow, GlowOrb, IconTile, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/reveal';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Logo } from '@/components/layout/logo';

export const metadata: Metadata = {
  title: 'Style Guide',
  robots: { index: false, follow: false },
};

/**
 * Internal design-system reference. Renders the ported primitives so their
 * fidelity to the original static design (and correct behaviour in both themes)
 * can be verified at a glance. Not linked in navigation; noindex.
 */
export default function StyleguidePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] py-24 text-[var(--text-primary)]">
      <Container>
        <div className="mb-12 flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>

        <Eyebrow>Design System</Eyebrow>
        <h1 className="display-xl mt-4">
          RFT360 <span className="text-accent-grad">Style Guide</span>
        </h1>
        <p className="mt-6 max-w-xl text-[var(--text-secondary)]">
          The ported design system — brand-correct colours (#DE181B) and typography (Manrope +
          Inter), verified in both light and dark themes.
        </p>

        {/* Colours */}
        <section className="mt-16">
          <SectionHeading eyebrow="Tokens" heading="Brand" accent="palette" />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['Accent', 'var(--accent)'],
              ['Surface', 'var(--bg-surface)'],
              ['Card', 'var(--bg-card)'],
              ['Border', 'var(--border)'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[var(--border)] p-4">
                <div
                  className="mb-3 h-16 rounded-lg border border-[var(--border)]"
                  style={{ background: value }}
                />
                <p className="text-sm font-semibold">{label}</p>
                <code className="text-xs text-[var(--text-muted)]">{value}</code>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mt-16">
          <SectionHeading eyebrow="Type" heading="Typographic" accent="scale" />
          <div className="mt-8 space-y-4">
            <p className="display-xl">Display XL</p>
            <p className="display-lg">Display LG</p>
            <p className="display-md">Display MD</p>
            <p className="text-lg text-[var(--text-secondary)]">
              Body — Inter regular, the workhorse for paragraphs, UI and forms.
            </p>
          </div>
        </section>

        {/* Buttons */}
        <section className="mt-16">
          <SectionHeading eyebrow="Actions" heading="Buttons" />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href="#">
              Primary <ArrowIcon />
            </ButtonLink>
            <ButtonLink href="#" variant="outline">
              Outline
            </ButtonLink>
            <ButtonLink href="#" variant="ghost">
              Ghost
            </ButtonLink>
          </div>
        </section>

        {/* Cards with reveal + glow */}
        <section className="relative mt-16 overflow-hidden rounded-3xl border border-[var(--border)] p-10">
          <GlowOrb className="h-[400px] w-[400px]" style={{ top: -100, right: -100 }} />
          <SectionHeading eyebrow="Components" heading="Card" accent="grid" />
          <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
            {['fa-solid fa-people-group', 'fa-solid fa-gem', 'fa-solid fa-flag-checkered'].map(
              (icon, i) => (
                <Reveal key={icon} delay={i * 0.08}>
                  <div className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-accent)] hover:bg-[var(--bg-card-hover)]">
                    <IconTile icon={icon} />
                    <h3 className="mt-4 font-[var(--font-heading)] text-lg font-semibold">
                      Card Title {i + 1}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      Hover to see the lift, border-accent and background shift ported from the
                      original design.
                    </p>
                  </div>
                </Reveal>
              ),
            )}
          </div>
        </section>
      </Container>
    </div>
  );
}
