import Image from 'next/image';
import { Container, Eyebrow, GlowOrb } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/reveal';
import { mediaSrc, type MediaRef } from '@/lib/utils';

/**
 * Shared inner-page hero. A compact, centered header used by every non-home
 * page (About Culture, Careers, Events, …) so they share a consistent top
 * treatment. Copy is CMS-driven via the page's eyebrow/heading/subheading.
 */
export function PageHero({
  eyebrow,
  heading,
  accent,
  subheading,
  image,
}: {
  eyebrow?: string | null;
  heading: string;
  accent?: string | null;
  subheading?: string | null;
  image?: MediaRef | null;
}) {
  const bg = mediaSrc(image, 'large');
  return (
    <section className="relative overflow-hidden bg-[var(--bg-dark)] pt-36 pb-16 text-center md:pt-44 md:pb-20">
      <GlowOrb className="h-[500px] w-[600px]" style={{ top: -100, left: '50%', transform: 'translateX(-50%)' }} />
      {bg && (
        <div className="absolute inset-0 -z-0 opacity-20">
          <Image src={bg} alt="" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-dark)]" />
        </div>
      )}
      <Container className="relative z-10" size="narrow">
        {eyebrow && (
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
        )}
        <Reveal delay={0.08}>
          <h1 className="display-lg mt-4">
            {heading} {accent && <span className="text-accent-grad">{accent}</span>}
          </h1>
        </Reveal>
        {subheading && (
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
              {subheading}
            </p>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
