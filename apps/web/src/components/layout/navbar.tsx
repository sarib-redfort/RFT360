'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export interface NavItem {
  label: string;
  href: string;
}

/**
 * Fixed site header — ports `.navbar`.
 *
 * Transparent at the top, then shrinks and gains a blurred background once
 * scrolled past 60px (same threshold as the original `main.js`). Links come
 * from the CMS; the CTA button and theme toggle sit on the right.
 */
export function Navbar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className={cn('navbar', scrolled && 'scrolled')}>
      <Logo priority />

      <ul className="nav-links hidden lg:flex">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={cn(isActive(item.href) && 'active')}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/careers" className="btn-primary hidden sm:inline-flex">
          Join Our Team
        </Link>
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-primary)] lg:hidden"
        >
          <i className={open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} aria-hidden />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="absolute inset-x-0 top-full border-t border-[var(--border)] bg-[var(--bg-dark)] lg:hidden">
          <ul className="flex flex-col gap-1 px-[5%] py-4">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
