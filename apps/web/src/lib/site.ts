import { CACHE_TAGS } from '@rft360/shared';
import { apiGet } from './api';
import type { MediaRef } from './utils';

/** Shape of the public site-settings payload. */
export interface SiteSettings {
  siteName: string;
  tagline?: string | null;
  description?: string | null;
  logoLight?: MediaRef | null;
  logoDark?: MediaRef | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  country?: string | null;
  mapEmbedUrl?: string | null;
  officeHours?: string | null;
  socialLinkedin?: string | null;
  socialFacebook?: string | null;
  socialInstagram?: string | null;
  socialTwitter?: string | null;
  socialYoutube?: string | null;
  socialTiktok?: string | null;
  footerText?: string | null;
  copyrightText?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  maintenanceMode?: boolean;
  maintenanceMessage?: string | null;
}

export interface NavigationItem {
  id: string;
  label: string;
  href?: string | null;
  openInNewTab?: boolean;
  isButton?: boolean;
  children?: NavigationItem[];
}

/** Sensible defaults so the site renders even before the API is seeded. */
const FALLBACK_NAV: NavigationItem[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'about', label: 'About Culture', href: '/about-culture' },
  { id: 'careers', label: 'Careers', href: '/careers' },
  { id: 'life', label: 'Life at RedFort', href: '/life-at-redfort' },
  { id: 'events', label: 'Events', href: '/events' },
  { id: 'gallery', label: 'Gallery', href: '/gallery' },
  { id: 'blogs', label: 'Blogs', href: '/blogs' },
  { id: 'contact', label: 'Contact', href: '/contact' },
];

export async function getSettings(): Promise<SiteSettings> {
  const settings = await apiGet<SiteSettings>('/settings', { tags: [CACHE_TAGS.settings] });
  return settings ?? { siteName: 'RFT360' };
}

export async function getHeaderNav(): Promise<NavigationItem[]> {
  const nav = await apiGet<NavigationItem[]>('/settings/navigation/header', {
    tags: [CACHE_TAGS.navigation],
  });
  return nav && nav.length > 0 ? nav : FALLBACK_NAV;
}

export async function getFooterNav(): Promise<NavigationItem[]> {
  const nav = await apiGet<NavigationItem[]>('/settings/navigation/footer', {
    tags: [CACHE_TAGS.navigation],
  });
  return nav ?? [];
}
