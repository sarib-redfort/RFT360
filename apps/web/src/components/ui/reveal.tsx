'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Direction = 'up' | 'left' | 'right' | 'scale';

interface RevealProps {
  children: ReactNode;
  /** Entry direction, matching the original `.animate-fade-*` variants. */
  direction?: Direction;
  /** Stagger in seconds, mirroring the original `.delay-N` classes. */
  delay?: number;
  className?: string;
  as?: ElementType;
}

/**
 * Scroll-triggered reveal. React port of the IntersectionObserver logic in the
 * original `main.js` — elements fade/slide in once when they enter the viewport
 * and then stay put. Honours `prefers-reduced-motion` (handled in CSS) and
 * reveals immediately if IntersectionObserver is unavailable.
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  className,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn('reveal', visible && 'is-visible', className)}
      data-direction={direction === 'up' ? undefined : direction}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
