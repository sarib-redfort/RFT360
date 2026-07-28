'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { FaqItem } from '@/lib/content-types';

/** Accessible FAQ accordion. One item open at a time; keyboard + ARIA wired. */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-[var(--font-heading)] text-base font-semibold text-[var(--text-primary)]">
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--accent)] transition-transform duration-300',
                    isOpen && 'rotate-45',
                  )}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              className={cn(
                'grid transition-all duration-300 ease-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
