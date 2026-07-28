'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Counts up to a numeric target when scrolled into view — React port of the
 * `animateCounter` logic in the original `main.js`. Preserves any non-numeric
 * suffix/prefix (e.g. "500+", "96%"). Respects reduced-motion by showing the
 * final value immediately.
 */
export function StatCounter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(value);
  const target = parseFloat(value.replace(/[^0-9.]/g, ''));
  const suffix = value.replace(/[0-9.,]/g, '');
  const hasNumber = !Number.isNaN(target);

  useEffect(() => {
    if (!hasNumber) return;
    const node = ref.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setDisplay(value);
      return;
    }

    setDisplay(`0${suffix}`);
    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const duration = 1600;
          const isFloat = value.includes('.');
          let start: number | null = null;
          const step = (ts: number) => {
            if (start === null) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;
            setDisplay(`${isFloat ? current.toFixed(1) : Math.floor(current)}${suffix}`);
            if (progress < 1) raf = requestAnimationFrame(step);
            else setDisplay(value);
          };
          raf = requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, target, suffix, hasNumber]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
