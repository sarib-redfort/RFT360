import { Container, Eyebrow } from '@/components/ui/primitives';
import { ButtonLink, ArrowIcon } from '@/components/ui/button';

/**
 * Rendered only when the homepage composite can't be fetched (API down or not
 * yet seeded). Keeps the site presentable instead of showing an error, and
 * points visitors to the key pages.
 */
export function HomeFallback() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[var(--bg-dark)]">
      <Container>
        <Eyebrow>RFT360 · Lahore, Pakistan</Eyebrow>
        <h1 className="display-xl mt-6 max-w-3xl">
          Build Your Career <span className="text-accent-grad">at RedFort</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[var(--text-secondary)]">
          We’re a team of builders creating world-class products — and an employer where talented
          people do the best work of their careers.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <ButtonLink href="/careers" size="lg">
            Explore Careers <ArrowIcon />
          </ButtonLink>
          <ButtonLink href="/life-at-redfort" variant="outline" size="lg">
            Life at RedFort
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
