'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Theme-aware brand logo.
 *
 * Both PNGs are rendered and CSS toggles which is visible based on the active
 * theme, so the swap is instant with no flash and needs no JS after mount.
 *  • logo-on-dark.png  — the white logo, shown on the dark theme
 *  • logo-on-light.png — the dark-ink logo, shown on the light theme
 */
export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/" aria-label="RFT360 — home" className={cn('inline-flex items-center', className)}>
      <span className="relative block h-11 w-[168px] sm:h-12 sm:w-[184px]">
        <Image
          src="/brand/logo-on-dark.png"
          alt="RFT360"
          fill
          priority={priority}
          sizes="184px"
          className="logo-on-dark object-contain object-left"
        />
        <Image
          src="/brand/logo-on-light.png"
          alt=""
          fill
          priority={priority}
          sizes="184px"
          className="logo-on-light object-contain object-left"
        />
      </span>
    </Link>
  );
}
