import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './reveal';

/**
 * Page-width wrapper.
 *
 * `default` and `wide` are fluid — they fill the viewport with proportional
 * gutters, so nothing is boxed into a narrow centred column on large monitors.
 * `narrow` keeps a reading-width cap for long-form prose (articles, job
 * descriptions), where full-bleed paragraphs would be hard to read.
 */
export function Container({
  children,
  className,
  size = 'default',
}: {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'wide' | 'narrow';
}) {
  return (
    <div className={cn('container-rft', size === 'narrow' && 'container-reading', className)}>
      {children}
    </div>
  );
}

/**
 * Soft radial glow blob — ports the `.orb` / `.glow-orb` decorations. Purely
 * decorative, sits behind content.
 */
export function GlowOrb({
  className,
  style,
  parallax = true,
}: {
  className?: string;
  style?: CSSProperties;
  /** Drift with the pointer (see `ParallaxOrbs`). */
  parallax?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        // Generous transparent falloff (was 65%) so that if the section's
        // `overflow:hidden` clips the orb, the cut lands in fully transparent
        // pixels and never reads as a hard edge.
        'pointer-events-none absolute rounded-full blur-[110px]',
        'bg-[radial-gradient(closest-side,var(--accent-glow)_0%,transparent_78%)]',
        parallax && 'orb-parallax',
        className,
      )}
      style={style}
    />
  );
}

/** Uppercase red kicker — ports `.eyebrow`. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('eyebrow', className)}>{children}</span>;
}

/**
 * Section header: eyebrow + display heading (with optional red-gradient
 * fragment) + optional lede — matching the original's rhythm and weights.
 */
export function SectionHeading({
  eyebrow,
  heading,
  accent,
  lede,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  heading: string;
  accent?: string;
  lede?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
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
      {lede && (
        <Reveal delay={0.16}>
          <p className={cn('body-text mt-5', align === 'center' && 'mx-auto')}>{lede}</p>
        </Reveal>
      )}
    </div>
  );
}

/**
 * Font Awesome icon by class string (CMS content stores icons as
 * `fa-solid fa-users`). Falls back to a neutral dot when unset.
 */
export function Icon({ name, className }: { name?: string | null; className?: string }) {
  if (!name) {
    return <span className={cn('inline-block h-2 w-2 rounded-full bg-current', className)} />;
  }
  return <i className={cn(name, className)} aria-hidden="true" />;
}

/** Red-tinted rounded icon tile — ports `.card-icon`. */
export function IconTile({
  icon,
  className,
  small,
}: {
  icon?: string | null;
  className?: string;
  small?: boolean;
}) {
  return (
    <div className={cn('card-icon', small && 'card-icon-sm', className)}>
      <Icon name={icon} />
    </div>
  );
}

/** Hairline gradient rule that tops sections — ports `section::before`. */
export function TopRule({ tone = 'accent' }: { tone?: 'accent' | 'muted' }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-px"
      style={{
        background:
          tone === 'accent'
            ? 'linear-gradient(90deg, transparent 0%, rgba(222,24,27,0.35) 50%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      }}
    />
  );
}

/** Animated mouse + "Scroll" caption — ports `.scroll-indicator`. */
export function ScrollIndicator({ label = 'Scroll' }: { label?: string }) {
  return (
    <div className="scroll-indicator" aria-hidden="true">
      <div className="scroll-mouse">
        <div className="scroll-wheel" />
      </div>
      <span>{label}</span>
    </div>
  );
}
