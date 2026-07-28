'use client';

import { useEffect, useRef, useState } from 'react';

export interface ProgressItem {
  label: string;
  value: string;
}

/**
 * Animated progress bars — ports `.progress-item` and `initProgressBars()`
 * from the original. Each track fills to its target width once scrolled into
 * view, with the white dot riding the end of the fill.
 */
export function ProgressBars({ items }: { items: ProgressItem[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setAnimate(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // The original delayed the fill by 300ms after entering view.
            window.setTimeout(() => setAnimate(true), 300);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {items.map((item) => (
        <div className="progress-item" key={item.label}>
          <div className="progress-header">
            <span className="progress-label">{item.label}</span>
            <span className="progress-value">{item.value}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: animate ? item.value : '0%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
