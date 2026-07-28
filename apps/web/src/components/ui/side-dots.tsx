'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Dot {
  id: string;
  label: string;
  top: number;
}

/**
 * Fixed right-edge section navigation — ports `.side-dots` and the scroll-spy
 * logic from the original `main.js`.
 *
 * Discovers `.scroll-section` elements at runtime (so it works regardless of
 * how many CMS sections are rendered), highlights the one currently in view,
 * and scrolls to a section on click. Labels come from each section's
 * `data-label` and show as hover tooltips.
 */
export function SideDots() {
  const [dots, setDots] = useState<Dot[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const collect = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('.scroll-section'));
      setDots(
        sections.map((section, i) => ({
          id: section.id || `section-${i}`,
          label: section.dataset.label || `Section ${i + 1}`,
          top: section.offsetTop,
        })),
      );
    };
    collect();
    // Sections can shift as images/fonts load.
    window.addEventListener('resize', collect);
    const timer = window.setTimeout(collect, 600);
    return () => {
      window.removeEventListener('resize', collect);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (dots.length === 0) return;
    const onScroll = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('.scroll-section'));
      const scrollTop = window.scrollY;
      const vh = window.innerHeight;
      let active = 0;
      sections.forEach((section, i) => {
        if (scrollTop >= section.offsetTop - vh * 0.4) active = i;
      });
      setActiveIndex(active);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dots.length]);

  if (dots.length < 2) return null;

  return (
    <nav className="side-dots" aria-label="Section navigation">
      {dots.map((dot, i) => (
        <button
          key={dot.id}
          type="button"
          data-label={dot.label}
          aria-label={`Go to ${dot.label}`}
          aria-current={i === activeIndex ? 'true' : undefined}
          className={cn('side-dot', i === activeIndex && 'active')}
          onClick={() => {
            const sections = document.querySelectorAll<HTMLElement>('.scroll-section');
            sections[i]?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      ))}
    </nav>
  );
}
