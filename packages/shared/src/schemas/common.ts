import { z } from 'zod';
import { ContentStatus } from '../enums';
import { PAGINATION } from '../constants';

/**
 * Reusable schema primitives.
 *
 * Everything validated anywhere in the system builds on these, so a rule such as
 * "what counts as a valid slug" is defined exactly once.
 */

/** CUID produced by Prisma's `@default(cuid())`. */
export const idSchema = z.string().min(1, 'Required').max(64);

/** URL-safe slug: lowercase alphanumerics separated by single hyphens. */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(160, 'Slug must be 160 characters or fewer')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers and single hyphens (e.g. life-at-redfort)',
  );

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(254)
  .toLowerCase()
  .trim();

/**
 * Permissive international phone check — digits with optional separators.
 * Deliberately loose: over-strict phone validation rejects legitimate numbers.
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Enter a valid phone number')
  .max(32)
  .regex(/^[+]?[\d\s().-]+$/, 'Enter a valid phone number');

/** Accepts an absolute URL or a site-relative path such as `/careers`. */
export const urlOrPathSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => value.startsWith('/') || /^https?:\/\//i.test(value),
    'Enter a full URL (https://…) or a path starting with /',
  );

/**
 * Password policy for CMS accounts: at least 10 characters with a lowercase
 * letter, an uppercase letter and a digit.
 */
export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(128, 'Password must be 128 characters or fewer')
  .regex(/[a-z]/, 'Include at least one lowercase letter')
  .regex(/[A-Z]/, 'Include at least one uppercase letter')
  .regex(/[0-9]/, 'Include at least one number');

export const contentStatusSchema = z.nativeEnum(ContentStatus);

/** Per-entity SEO overrides; blank fields fall back to site defaults. */
export const seoSchema = z.object({
  metaTitle: z.string().trim().max(70, 'Keep meta titles under 70 characters').optional(),
  metaDescription: z
    .string()
    .trim()
    .max(180, 'Keep meta descriptions under 180 characters')
    .optional(),
  metaKeywords: z.string().trim().max(255).optional(),
  ogImageId: idSchema.nullish(),
  canonicalUrl: z.string().url().nullish(),
  noIndex: z.boolean().default(false),
});
export type SeoInput = z.infer<typeof seoSchema>;

/** Query string accepted by list endpoints. Coerced because it arrives as text. */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.defaultPage),
  limit: z.coerce.number().int().min(1).max(PAGINATION.maxLimit).default(PAGINATION.defaultLimit),
  search: z.string().trim().max(200).optional(),
  sortBy: z.string().trim().max(64).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: contentStatusSchema.optional(),
});
export type ListQueryInput = z.infer<typeof listQuerySchema>;

/** Fields every editable content entity shares. */
export const contentBaseSchema = z.object({
  status: contentStatusSchema.default(ContentStatus.DRAFT),
  order: z.coerce.number().int().min(0).default(0),
  publishedAt: z.coerce.date().nullish(),
});

/** Payload for drag-and-drop reordering. */
export const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: idSchema,
        order: z.coerce.number().int().min(0),
      }),
    )
    .min(1, 'Provide at least one item to reorder'),
});
export type ReorderInput = z.infer<typeof reorderSchema>;
