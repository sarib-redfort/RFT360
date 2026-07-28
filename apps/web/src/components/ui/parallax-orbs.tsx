'use client';

import { useEffect } from 'react';

/**
 * Gives every `.orb-parallax` element a subtle pointer-follow drift — a React
 * port of `initParallax()` from the original `main.js`.
 *
 * Writes two CSS custom properties instead of inline transforms so the CSS owns
 * the easing, and updates inside rAF so pointer movement can't outpace paint.
 * No-ops for reduced-motion and on touch devices (no meaningful pointer).
 */
export function ParallaxOrbs() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      const orbs = document.querySelectorAll<HTMLElement>('.orb-parallax');
      orbs.forEach((orb, i) => {
        // Deeper orbs move further, which reads as depth.
        const depth = (i + 1) * 0.45;
        orb.style.setProperty('--px', `${x * depth}px`);
        orb.style.setProperty('--py', `${y * depth}px`);
      });
    };

    const onMove = (event: PointerEvent) => {
      x = (event.clientX / window.innerWidth - 0.5) * 22;
      y = (event.clientY / window.innerHeight - 0.5) * 22;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
