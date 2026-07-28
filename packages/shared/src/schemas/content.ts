import { z } from 'zod';
import {
  EmploymentType,
  EventStatus,
  ExperienceLevel,
  HomepageSectionType,
  NavLocation,
  WorkMode,
} from '../enums';
import {
  contentBaseSchema,
  emailSchema,
  idSchema,
  seoSchema,
  slugSchema,
  urlOrPathSchema,
} from './common';

/**
 * CMS content schemas — one per editable entity.
 *
 * Each `*Schema` is the create payload. Update payloads are derived with
 * `.partial()` so an editor can PATCH a single field without resending the rest.
 */

/**
 * Slug is OPTIONAL on create: `PublishableCrudService` derives it from the
 * entity's title/name and guarantees uniqueness. Requiring it here would
 * reject the CMS form, which intentionally leaves the field blank to opt into
 * auto-generation. Supplying a slug still overrides the derived one.
 */
const optionalSlug = slugSchema.optional();

const title = (max = 200) => z.string().trim().min(1, 'Title is required').max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

/** Tiptap document. Stored as JSON alongside server-sanitised HTML. */
const richTextSchema = z.object({
  /** Tiptap's ProseMirror JSON — the editable source of truth. */
  json: z.unknown().nullable(),
  /** Rendered HTML. Always re-sanitised server-side before it is persisted. */
  html: z.string().max(500_000).default(''),
});
export type RichTextInput = z.infer<typeof richTextSchema>;

/** A call-to-action button rendered in heroes and CTA blocks. */
const ctaSchema = z.object({
  label: z.string().trim().max(60),
  href: urlOrPathSchema,
  variant: z.enum(['primary', 'outline']).default('primary'),
});

// ---------------------------------------------------------------------------
// Site settings (singleton)
// ---------------------------------------------------------------------------

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  tagline: optionalText(200),
  description: optionalText(500),
  /** Shown on light backgrounds — the dark-ink logo. */
  logoLightId: idSchema.nullish(),
  /** Shown on dark backgrounds — the white logo. */
  logoDarkId: idSchema.nullish(),
  faviconId: idSchema.nullish(),
  defaultOgImageId: idSchema.nullish(),

  contactEmail: emailSchema.optional().or(z.literal('')),
  contactPhone: optionalText(32),
  addressLine1: optionalText(160),
  addressLine2: optionalText(160),
  city: optionalText(80),
  country: optionalText(80),
  mapEmbedUrl: optionalText(1000),
  officeHours: optionalText(160),

  socialLinkedin: optionalText(255),
  socialFacebook: optionalText(255),
  socialInstagram: optionalText(255),
  socialTwitter: optionalText(255),
  socialYoutube: optionalText(255),
  socialTiktok: optionalText(255),

  footerText: optionalText(500),
  copyrightText: optionalText(200),

  metaTitle: optionalText(70),
  metaDescription: optionalText(180),
  metaKeywords: optionalText(255),

  googleAnalyticsId: optionalText(40),
  googleTagManagerId: optionalText(40),
  facebookPixelId: optionalText(40),

  /** Serves a maintenance page to the public site while editors keep working. */
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: optionalText(500),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export const updateSiteSettingsSchema = siteSettingsSchema.partial();
export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;

// ---------------------------------------------------------------------------
// Navigation — header menu, footer columns and legal links
// ---------------------------------------------------------------------------

/**
 * A footer column is a `FOOTER` item with no parent; its links are children of
 * that item. The header uses the same parent/child shape for dropdown menus.
 */
export const navigationItemSchema = contentBaseSchema.extend({
  label: z.string().trim().min(1, 'Label is required').max(80),
  href: urlOrPathSchema.optional().or(z.literal('')),
  location: z.nativeEnum(NavLocation).default(NavLocation.HEADER),
  parentId: idSchema.nullish(),
  openInNewTab: z.boolean().default(false),
  /** Renders the item as a highlighted button rather than a plain link. */
  isButton: z.boolean().default(false),
  icon: optionalText(60),
});
export type NavigationItemInput = z.infer<typeof navigationItemSchema>;
export const updateNavigationItemSchema = navigationItemSchema.partial();

// ---------------------------------------------------------------------------
// Pages — per-page hero copy and SEO for the eight planner routes
// ---------------------------------------------------------------------------

export const pageSchema = contentBaseSchema.extend({
  slug: optionalSlug,
  title: title(160),
  eyebrow: optionalText(80),
  heading: optionalText(200),
  /** Portion of the heading rendered in the brand-red gradient. */
  headingAccent: optionalText(200),
  subheading: optionalText(500),
  heroImageId: idSchema.nullish(),
  body: richTextSchema.optional(),
  seo: seoSchema.optional(),
});
export type PageInput = z.infer<typeof pageSchema>;
export const updatePageSchema = pageSchema.partial();

// ---------------------------------------------------------------------------
// Homepage sections — the planner's mandated flow, reorderable in the CMS
// ---------------------------------------------------------------------------

export const homepageSectionSchema = contentBaseSchema.extend({
  type: z.nativeEnum(HomepageSectionType),
  /** Internal label shown in the CMS section list. */
  name: z.string().trim().min(1).max(120),
  isVisible: z.boolean().default(true),

  eyebrow: optionalText(80),
  heading: optionalText(200),
  /** Portion of the heading rendered in the brand-red gradient. */
  headingAccent: optionalText(200),
  subheading: optionalText(1000),
  body: richTextSchema.optional(),

  imageId: idSchema.nullish(),
  ctaPrimary: ctaSchema.nullish(),
  ctaSecondary: ctaSchema.nullish(),

  /** How many linked records to show (latest blogs, testimonials, …). */
  itemLimit: z.coerce.number().int().min(1).max(24).default(6),

  /** Type-specific extras that do not warrant their own column. */
  settings: z.record(z.unknown()).default({}),
});
export type HomepageSectionInput = z.infer<typeof homepageSectionSchema>;
export const updateHomepageSectionSchema = homepageSectionSchema.partial();

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export const postCategorySchema = contentBaseSchema.extend({
  name: z.string().trim().min(1, 'Name is required').max(80),
  slug: optionalSlug,
  description: optionalText(500),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour such as #DE181B')
    .optional()
    .or(z.literal('')),
});
export type PostCategoryInput = z.infer<typeof postCategorySchema>;
export const updatePostCategorySchema = postCategorySchema.partial();

export const tagSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  slug: optionalSlug,
});
export type TagInput = z.infer<typeof tagSchema>;
export const updateTagSchema = tagSchema.partial();

export const postSchema = contentBaseSchema.extend({
  title: title(200),
  slug: optionalSlug,
  excerpt: z
    .string()
    .trim()
    .max(400, 'Excerpt must be 400 characters or fewer')
    .optional()
    .or(z.literal('')),
  content: richTextSchema,
  coverImageId: idSchema.nullish(),
  categoryId: idSchema.nullish(),
  authorId: idSchema.nullish(),
  tagIds: z.array(idSchema).max(20).default([]),
  /** Pins the post to the featured slot on the blog index. */
  isFeatured: z.boolean().default(false),
  /** Minutes to read; recalculated from content when omitted. */
  readingMinutes: z.coerce.number().int().min(1).max(180).nullish(),
  seo: seoSchema.optional(),
});
export type PostInput = z.infer<typeof postSchema>;
export const updatePostSchema = postSchema.partial();

// ---------------------------------------------------------------------------
// Careers
// ---------------------------------------------------------------------------

export const departmentSchema = contentBaseSchema.extend({
  name: z.string().trim().min(1, 'Name is required').max(80),
  slug: optionalSlug,
  description: optionalText(500),
  icon: optionalText(60),
});
export type DepartmentInput = z.infer<typeof departmentSchema>;
export const updateDepartmentSchema = departmentSchema.partial();

export const jobSchema = contentBaseSchema.extend({
  title: title(160),
  slug: optionalSlug,
  departmentId: idSchema.nullish(),
  location: z.string().trim().min(1, 'Location is required').max(120),
  employmentType: z.nativeEnum(EmploymentType).default(EmploymentType.FULL_TIME),
  workMode: z.nativeEnum(WorkMode).default(WorkMode.ONSITE),
  experienceLevel: z.nativeEnum(ExperienceLevel).default(ExperienceLevel.MID),
  summary: optionalText(600),
  description: richTextSchema,
  responsibilities: z.array(z.string().trim().max(500)).max(30).default([]),
  requirements: z.array(z.string().trim().max(500)).max(30).default([]),
  niceToHave: z.array(z.string().trim().max(500)).max(30).default([]),
  benefits: z.array(z.string().trim().max(500)).max(30).default([]),
  skills: z.array(z.string().trim().max(60)).max(30).default([]),
  salaryMin: z.coerce.number().int().min(0).nullish(),
  salaryMax: z.coerce.number().int().min(0).nullish(),
  salaryCurrency: z.string().trim().length(3).default('PKR'),
  /** Hides the range on the public posting while keeping it for reporting. */
  hideSalary: z.boolean().default(true),
  openings: z.coerce.number().int().min(1).max(999).default(1),
  applicationDeadline: z.coerce.date().nullish(),
  isFeatured: z.boolean().default(false),
  seo: seoSchema.optional(),
});
export type JobInput = z.infer<typeof jobSchema>;
export const updateJobSchema = jobSchema.partial();

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const eventSchema = contentBaseSchema.extend({
  title: title(200),
  slug: optionalSlug,
  summary: optionalText(600),
  description: richTextSchema.optional(),
  coverImageId: idSchema.nullish(),
  galleryImageIds: z.array(idSchema).max(60).default([]),
  eventStatus: z.nativeEnum(EventStatus).default(EventStatus.UPCOMING),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().nullish(),
  location: optionalText(200),
  isFeatured: z.boolean().default(false),
  seo: seoSchema.optional(),
});
export type EventInput = z.infer<typeof eventSchema>;
export const updateEventSchema = eventSchema.partial();

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

export const galleryAlbumSchema = contentBaseSchema.extend({
  title: title(160),
  slug: optionalSlug,
  description: optionalText(500),
  coverImageId: idSchema.nullish(),
  takenAt: z.coerce.date().nullish(),
});
export type GalleryAlbumInput = z.infer<typeof galleryAlbumSchema>;
export const updateGalleryAlbumSchema = galleryAlbumSchema.partial();

export const galleryImageSchema = z.object({
  albumId: idSchema,
  mediaId: idSchema,
  caption: optionalText(300),
  order: z.coerce.number().int().min(0).default(0),
});
export type GalleryImageInput = z.infer<typeof galleryImageSchema>;
export const updateGalleryImageSchema = galleryImageSchema.partial();

// ---------------------------------------------------------------------------
// Social proof
// ---------------------------------------------------------------------------

export const testimonialSchema = contentBaseSchema.extend({
  /** Employee testimonials — this is an employer-branding site. */
  authorName: z.string().trim().min(1, 'Name is required').max(120),
  authorRole: optionalText(120),
  authorCompany: optionalText(120),
  avatarId: idSchema.nullish(),
  quote: z.string().trim().min(10, 'Quote is required').max(1200),
  rating: z.coerce.number().int().min(1).max(5).nullish(),
  isFeatured: z.boolean().default(false),
});
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export const updateTestimonialSchema = testimonialSchema.partial();

export const faqSchema = contentBaseSchema.extend({
  question: z.string().trim().min(1, 'Question is required').max(300),
  answer: z.string().trim().min(1, 'Answer is required').max(3000),
  category: optionalText(80),
});
export type FaqInput = z.infer<typeof faqSchema>;
export const updateFaqSchema = faqSchema.partial();

export const caseStudySchema = contentBaseSchema.extend({
  title: title(200),
  slug: optionalSlug,
  /** Reframed as employee success stories for the employer-branding site. */
  subtitle: optionalText(300),
  summary: optionalText(600),
  content: richTextSchema.optional(),
  coverImageId: idSchema.nullish(),
  clientName: optionalText(120),
  industryId: idSchema.nullish(),
  /** Headline outcomes rendered as a stat row, e.g. `{label, value}`. */
  results: z
    .array(
      z.object({
        label: z.string().trim().max(80),
        value: z.string().trim().max(40),
      }),
    )
    .max(8)
    .default([]),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
  isFeatured: z.boolean().default(false),
  seo: seoSchema.optional(),
});
export type CaseStudyInput = z.infer<typeof caseStudySchema>;
export const updateCaseStudySchema = caseStudySchema.partial();

// ---------------------------------------------------------------------------
// Capability blocks
// ---------------------------------------------------------------------------

export const industrySchema = contentBaseSchema.extend({
  name: z.string().trim().min(1, 'Name is required').max(120),
  slug: optionalSlug,
  description: optionalText(600),
  /** Font Awesome class, e.g. `fa-solid fa-credit-card`. */
  icon: optionalText(60),
  imageId: idSchema.nullish(),
});
export type IndustryInput = z.infer<typeof industrySchema>;
export const updateIndustrySchema = industrySchema.partial();

export const serviceSchema = contentBaseSchema.extend({
  title: title(160),
  slug: optionalSlug,
  shortDescription: optionalText(400),
  description: richTextSchema.optional(),
  icon: optionalText(60),
  imageId: idSchema.nullish(),
  features: z.array(z.string().trim().max(300)).max(20).default([]),
  isFeatured: z.boolean().default(false),
  seo: seoSchema.optional(),
});
export type ServiceInput = z.infer<typeof serviceSchema>;
export const updateServiceSchema = serviceSchema.partial();

// ---------------------------------------------------------------------------
// People and culture
// ---------------------------------------------------------------------------

export const teamMemberSchema = contentBaseSchema.extend({
  name: z.string().trim().min(1, 'Name is required').max(120),
  role: z.string().trim().min(1, 'Role is required').max(120),
  departmentId: idSchema.nullish(),
  bio: optionalText(1500),
  photoId: idSchema.nullish(),
  linkedinUrl: optionalText(255),
  twitterUrl: optionalText(255),
  email: emailSchema.optional().or(z.literal('')),
  /** Surfaces the member in the leadership block on About Culture. */
  isLeadership: z.boolean().default(false),
});
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
export const updateTeamMemberSchema = teamMemberSchema.partial();

export const cultureValueSchema = contentBaseSchema.extend({
  title: title(120),
  description: z.string().trim().min(1, 'Description is required').max(800),
  icon: optionalText(60),
});
export type CultureValueInput = z.infer<typeof cultureValueSchema>;
export const updateCultureValueSchema = cultureValueSchema.partial();

export const perkSchema = contentBaseSchema.extend({
  title: title(120),
  description: z.string().trim().min(1, 'Description is required').max(800),
  icon: optionalText(60),
});
export type PerkInput = z.infer<typeof perkSchema>;
export const updatePerkSchema = perkSchema.partial();

// ---------------------------------------------------------------------------
// Trust elements (planner Phase 3)
// ---------------------------------------------------------------------------

export const clientLogoSchema = contentBaseSchema.extend({
  name: z.string().trim().min(1, 'Name is required').max(120),
  logoId: idSchema.nullish(),
  websiteUrl: optionalText(255),
  /** `false` renders the logo as a partner rather than a client. */
  isClient: z.boolean().default(true),
});
export type ClientLogoInput = z.infer<typeof clientLogoSchema>;
export const updateClientLogoSchema = clientLogoSchema.partial();

export const certificationSchema = contentBaseSchema.extend({
  name: z.string().trim().min(1, 'Name is required').max(160),
  issuer: optionalText(120),
  description: optionalText(500),
  logoId: idSchema.nullish(),
  icon: optionalText(60),
  issuedAt: z.coerce.date().nullish(),
  expiresAt: z.coerce.date().nullish(),
  credentialUrl: optionalText(255),
});
export type CertificationInput = z.infer<typeof certificationSchema>;
export const updateCertificationSchema = certificationSchema.partial();

export const awardSchema = contentBaseSchema.extend({
  title: title(160),
  issuer: optionalText(120),
  description: optionalText(500),
  imageId: idSchema.nullish(),
  icon: optionalText(60),
  awardedAt: z.coerce.date().nullish(),
});
export type AwardInput = z.infer<typeof awardSchema>;
export const updateAwardSchema = awardSchema.partial();

export const statisticSchema = contentBaseSchema.extend({
  /** Displayed verbatim, so `500+` and `98%` both work. */
  value: z.string().trim().min(1, 'Value is required').max(20),
  label: z.string().trim().min(1, 'Label is required').max(80),
  description: optionalText(300),
  icon: optionalText(60),
});
export type StatisticInput = z.infer<typeof statisticSchema>;
export const updateStatisticSchema = statisticSchema.partial();

// ---------------------------------------------------------------------------
// Media library
// ---------------------------------------------------------------------------

/** Only metadata is editable — the binary is immutable once uploaded. */
export const updateMediaSchema = z.object({
  alt: optionalText(300),
  caption: optionalText(500),
  title: optionalText(200),
  folder: optionalText(120),
});
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
