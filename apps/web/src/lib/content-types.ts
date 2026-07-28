import type { HomepageSectionType } from '@rft360/shared';
import type { MediaRef } from './utils';

/**
 * Front-end view models for the public API payloads.
 *
 * These are read-only shapes the API returns (a subset of the Prisma models),
 * kept here so components stay decoupled from Prisma internals.
 */

export interface Cta {
  label: string;
  href: string;
  variant?: 'primary' | 'outline';
}

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  icon?: string | null;
  image?: MediaRef | null;
  features?: string[];
}

export interface IndustryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
}

export interface PerkItem {
  id: string;
  title: string;
  description: string;
  icon?: string | null;
}

export interface ValueItem {
  id: string;
  title: string;
  description: string;
  icon?: string | null;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  description?: string | null;
  icon?: string | null;
}

export interface TestimonialItem {
  id: string;
  authorName: string;
  authorRole?: string | null;
  authorCompany?: string | null;
  avatar?: MediaRef | null;
  quote: string;
  rating?: number | null;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
}

export interface CaseStudyItem {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  summary?: string | null;
  coverImage?: MediaRef | null;
  clientName?: string | null;
  results?: { label: string; value: string }[];
  tags?: string[];
}

export interface PostItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: MediaRef | null;
  category?: { id: string; name: string; slug: string; color?: string | null } | null;
  author?: { id: string; name: string; role?: string | null; photo?: MediaRef | null } | null;
  tags?: { id: string; name: string; slug: string }[];
  readingMinutes?: number | null;
  publishedAt?: string | null;
  contentHtml?: string;
  viewCount?: number;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string;
  bio?: string | null;
  photo?: MediaRef | null;
  linkedinUrl?: string | null;
  isLeadership?: boolean;
}

export interface LogoItem {
  id: string;
  name: string;
  logo?: MediaRef | null;
  websiteUrl?: string | null;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer?: string | null;
  icon?: string | null;
  logo?: MediaRef | null;
}

export interface AwardItem {
  id: string;
  title: string;
  issuer?: string | null;
  icon?: string | null;
}

export interface JobItem {
  id: string;
  title: string;
  slug: string;
  location: string;
  employmentType: string;
  workMode: string;
  experienceLevel: string;
  summary?: string | null;
  department?: { id: string; name: string; slug: string; icon?: string | null } | null;
  skills?: string[];
  responsibilities?: string[];
  requirements?: string[];
  niceToHave?: string[];
  benefits?: string[];
  descriptionHtml?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  hideSalary?: boolean;
  applicationDeadline?: string | null;
  createdAt?: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  descriptionHtml?: string | null;
  coverImage?: MediaRef | null;
  eventStatus: string;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
}

export interface GalleryImageItem {
  id: string;
  caption?: string | null;
  media: MediaRef;
}

export interface GalleryAlbumItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: MediaRef | null;
  images?: GalleryImageItem[];
  takenAt?: string | null;
}

/** A homepage section as returned by the composite endpoint. */
export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  name: string;
  eyebrow?: string | null;
  heading?: string | null;
  headingAccent?: string | null;
  subheading?: string | null;
  bodyHtml?: string | null;
  image?: MediaRef | null;
  ctaPrimary?: Cta | null;
  ctaSecondary?: Cta | null;
  itemLimit: number;
  settings?: Record<string, unknown>;
  /** Linked records resolved for this section's type. */
  data?: unknown;
}

export interface HomepageComposite {
  sections: HomepageSection[];
}

export interface PageDetail {
  id: string;
  slug: string;
  title: string;
  eyebrow?: string | null;
  heading?: string | null;
  /** Portion of the heading rendered in the brand-red gradient. */
  headingAccent?: string | null;
  subheading?: string | null;
  heroImage?: MediaRef | null;
  bodyHtml?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}
