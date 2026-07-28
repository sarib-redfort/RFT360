import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

/**
 * Buttons port `.btn-primary` / `.btn-outline` from the original stylesheet —
 * the base look (fill, radius, weight, hover lift + red glow) lives in
 * `globals.css`; only size overrides are applied here.
 */
const variants: Record<Variant, string> = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost:
    'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]',
};

// The original's default is 0.7rem/1.5rem @ .875rem — that's `md`.
const sizes: Record<Size, string> = {
  sm: 'text-[0.825rem] px-[1.1rem] py-[0.55rem]',
  md: '',
  lg: 'text-[0.95rem] px-8 py-[0.9rem]',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

/** Anchor variant — renders a Next.js Link (or a safe external anchor). */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
  external,
}: CommonProps & { href: string; external?: boolean }) {
  const classes = cn(variants[variant], sizes[size], className);
  if (external || /^https?:\/\//.test(href)) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

/** Native button variant. */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

/** Small right arrow used on CTAs (the original used `fa-arrow-right`). */
export function ArrowIcon({ className = '' }: { className?: string }) {
  return <i className={cn('fa-solid fa-arrow-right text-[0.75rem]', className)} aria-hidden="true" />;
}
