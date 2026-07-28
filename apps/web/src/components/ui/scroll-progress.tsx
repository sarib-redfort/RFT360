'use client';

import { useEffect, useRef } from 'react';

/**
 * Thin brand-red bar across the top showing read progress.
 *
 * Scales an element via `transform` inside rAF rather than animating `width`,
 * so it never triggers layout during scroll. Hidden entirely for visitors who
 * prefer reduced motion.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const node = ref.current;
      if (!node) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      node.style.transform = `scaleX(${progress})`;
      node.style.opacity = progress > 0.005 ? '1' : '0';
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="scroll-progress w-full opacity-0 transition-opacity duration-300"
      style={{ transform: 'scaleX(0)' }}
    />
  );
}
