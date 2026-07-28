import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Container, GlowOrb } from './primitives';

/**
 * Full-width section shell — ports `.scroll-section`.
 *
 * Matches the original exactly: `min-height: 100vh`, vertically centred
 * content, `padding: 5rem 5% 0`, overflow hidden, and an optional hairline top
 * rule + glow orb. Scroll-snap is intentionally not applied (identical look,
 * better readability for long lists).
 */
export function Section({
  id,
  label,
  children,
  className,
  tone = 'dark',
  topRule,
  glow,
  glowStyle,
  containerSize = 'default',
  fullHeight = true,
}: {
  id?: string;
  /** Shown in the side-dot tooltip. */
  label?: string;
  children: ReactNode;
  className?: string;
  tone?: 'dark' | 'surface';
  topRule?: 'accent' | 'muted';
  glow?: boolean;
  glowStyle?: CSSProperties;
  containerSize?: 'default' | 'wide' | 'narrow';
  fullHeight?: boolean;
}) {
  return (
    <section
      id={id}
      data-label={label}
      className={cn(
        'scroll-section',
        !fullHeight && 'min-h-0 py-20',
        topRule === 'accent' && 'section-rule-accent',
        topRule === 'muted' && 'section-rule-muted',
        tone === 'surface' ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-dark)]',
        className,
      )}
    >
      {glow && (
        <GlowOrb
          className="h-[500px] w-[600px]"
          style={glowStyle ?? { top: '20%', right: '-150px' }}
        />
      )}
      <Container size={containerSize} className="relative z-[1]">
        {children}
      </Container>
    </section>
  );
}
