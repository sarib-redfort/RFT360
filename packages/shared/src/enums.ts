/**
 * Enumerations shared by the API and the web app.
 *
 * These are declared as `as const` objects rather than TypeScript `enum`s so the
 * values are plain strings at runtime — that keeps them structurally identical to
 * the string unions Prisma generates, so a Prisma model field can be assigned to
 * one of these types (and vice versa) without a cast.
 *
 * Every value here MUST stay in sync with `apps/api/prisma/schema.prisma`.
 */

/** CMS access levels, ordered from most to least privileged. */
export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

/**
 * Privilege ranking used by `RolesGuard`. A higher number outranks a lower one,
 * which lets a single check cover "this role or better".
 */
export const ROLE_RANK: Record<Role, number> = {
  SUPER_ADMIN: 40,
  ADMIN: 30,
  EDITOR: 20,
  VIEWER: 10,
};

/** Publication state carried by every content entity. */
export const ContentStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];

/**
 * Homepage section types.
 *
 * The first ten mirror the mandated flow from `Website Development Planner.docx`
 * (Hero -> Who We Are -> Services -> Why Choose Us -> Industries -> Case Studies
 * -> Testimonials -> FAQ -> Latest Blogs -> Contact Form). The remainder are the
 * planner's Phase 3 "trust elements" plus a few generic blocks, all optional and
 * insertable at any position from the CMS.
 */
export const HomepageSectionType = {
  HERO: 'HERO',
  WHO_WE_ARE: 'WHO_WE_ARE',
  SERVICES: 'SERVICES',
  WHY_CHOOSE_US: 'WHY_CHOOSE_US',
  INDUSTRIES: 'INDUSTRIES',
  CASE_STUDIES: 'CASE_STUDIES',
  TESTIMONIALS: 'TESTIMONIALS',
  FAQ: 'FAQ',
  LATEST_BLOGS: 'LATEST_BLOGS',
  CONTACT_FORM: 'CONTACT_FORM',
  // Trust elements (planner Phase 3)
  CLIENT_LOGOS: 'CLIENT_LOGOS',
  PARTNER_LOGOS: 'PARTNER_LOGOS',
  CERTIFICATIONS: 'CERTIFICATIONS',
  STATISTICS: 'STATISTICS',
  AWARDS: 'AWARDS',
  // Additional optional blocks
  TEAM: 'TEAM',
  VALUES: 'VALUES',
  PERKS: 'PERKS',
  EVENTS: 'EVENTS',
  GALLERY: 'GALLERY',
  CTA: 'CTA',
  RICH_TEXT: 'RICH_TEXT',
} as const;
export type HomepageSectionType = (typeof HomepageSectionType)[keyof typeof HomepageSectionType];

/** The exact order mandated by the planner, used to seed a fresh database. */
export const PLANNER_SECTION_ORDER: HomepageSectionType[] = [
  HomepageSectionType.HERO,
  HomepageSectionType.WHO_WE_ARE,
  HomepageSectionType.SERVICES,
  HomepageSectionType.WHY_CHOOSE_US,
  HomepageSectionType.INDUSTRIES,
  HomepageSectionType.CASE_STUDIES,
  HomepageSectionType.TESTIMONIALS,
  HomepageSectionType.FAQ,
  HomepageSectionType.LATEST_BLOGS,
  HomepageSectionType.CONTACT_FORM,
];

/** Employment arrangement for a job opening. */
export const EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP',
  TEMPORARY: 'TEMPORARY',
} as const;
export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType];

/** Where the role is performed. */
export const WorkMode = {
  ONSITE: 'ONSITE',
  HYBRID: 'HYBRID',
  REMOTE: 'REMOTE',
} as const;
export type WorkMode = (typeof WorkMode)[keyof typeof WorkMode];

/** Seniority band advertised on a job posting. */
export const ExperienceLevel = {
  INTERNSHIP: 'INTERNSHIP',
  ENTRY: 'ENTRY',
  MID: 'MID',
  SENIOR: 'SENIOR',
  LEAD: 'LEAD',
  EXECUTIVE: 'EXECUTIVE',
} as const;
export type ExperienceLevel = (typeof ExperienceLevel)[keyof typeof ExperienceLevel];

/** Recruiter-facing pipeline state for a submitted application. */
export const ApplicationStatus = {
  NEW: 'NEW',
  REVIEWING: 'REVIEWING',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEWING: 'INTERVIEWING',
  OFFERED: 'OFFERED',
  HIRED: 'HIRED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
} as const;
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

/** Triage state for a contact-form submission. */
export const SubmissionStatus = {
  NEW: 'NEW',
  READ: 'READ',
  REPLIED: 'REPLIED',
  ARCHIVED: 'ARCHIVED',
  SPAM: 'SPAM',
} as const;
export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

/** Whether an event is upcoming, running, finished or called off. */
export const EventStatus = {
  UPCOMING: 'UPCOMING',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

/** Broad classification of an uploaded file. */
export const MediaType = {
  IMAGE: 'IMAGE',
  DOCUMENT: 'DOCUMENT',
  VIDEO: 'VIDEO',
  OTHER: 'OTHER',
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

/** Where a navigation item is rendered. */
export const NavLocation = {
  HEADER: 'HEADER',
  FOOTER: 'FOOTER',
  LEGAL: 'LEGAL',
} as const;
export type NavLocation = (typeof NavLocation)[keyof typeof NavLocation];

/** Mutating actions recorded in the audit log. */
export const AuditAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  PUBLISH: 'PUBLISH',
  UNPUBLISH: 'UNPUBLISH',
  ARCHIVE: 'ARCHIVE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  UPLOAD: 'UPLOAD',
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];
