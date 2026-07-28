/**
 * Brand and product constants.
 *
 * Colour and typography values come from `Redfort Tech Brand Guide.pdf` and are
 * the single source of truth for both apps. The web app mirrors these into CSS
 * custom properties in `apps/web/src/styles/tokens.css` — change them here and
 * update that file to match.
 */

/** Exact palette from the brand guide. */
export const BRAND_COLORS = {
  /** Primary Red — #DE181B / rgb(222, 24, 27) */
  primaryRed: '#DE181B',
  /** Primary Black — #13120D / rgb(19, 18, 13) */
  primaryBlack: '#13120D',
  /** White — #FFFFFF */
  white: '#FFFFFF',
} as const;

/**
 * Typography rules from the brand guide.
 * Manrope carries all headings; Inter carries body, UI and form text.
 */
export const BRAND_TYPOGRAPHY = {
  headingFont: 'Manrope',
  bodyFont: 'Inter',
  /** Weights the brand guide permits for each family. */
  headingWeights: [500, 600, 700, 800],
  bodyWeights: [400, 500, 600],
  /** Element -> weight mapping straight from the guide's hierarchy table. */
  hierarchy: {
    heroTitle: { font: 'Manrope', weight: 800 },
    h1: { font: 'Manrope', weight: 700 },
    h2: { font: 'Manrope', weight: 600 },
    h3: { font: 'Manrope', weight: 600 },
    h4: { font: 'Manrope', weight: 500 },
    body: { font: 'Inter', weight: 400 },
    smallText: { font: 'Inter', weight: 400 },
    buttons: { font: 'Inter', weight: 600 },
    navigation: { font: 'Inter', weight: 500 },
    captions: { font: 'Inter', weight: 400 },
  },
} as const;

/** Product identity. */
export const SITE = {
  name: 'RFT360',
  parentOrganization: 'RFT360',
  /** From the business portfolio: employer branding, not client services. */
  tagline: 'Build Your Career at RedFort',
  defaultLocale: 'en',
  country: 'Pakistan',
} as const;

/**
 * The eight navbar pages mandated by `Website Development Planner.docx`.
 * Used to seed the navigation table; editable from the CMS afterwards.
 */
export const PLANNER_PAGES = [
  { label: 'Home', path: '/' },
  { label: 'About Culture', path: '/about-culture' },
  { label: 'Careers', path: '/careers' },
  { label: 'Life at RedFort', path: '/life-at-redfort' },
  { label: 'Events', path: '/events' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Contact', path: '/contact' },
] as const;

/** Upload constraints, enforced on both the client and the server. */
export const UPLOAD_LIMITS = {
  maxImageBytes: 10 * 1024 * 1024, // 10 MB
  maxDocumentBytes: 10 * 1024 * 1024, // 10 MB
  allowedImageMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/svg+xml',
  ],
  allowedDocumentMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const;

/** Responsive variants generated for every uploaded raster image. */
export const IMAGE_VARIANTS = {
  thumbnail: { width: 320, height: 320 },
  medium: { width: 800, height: 800 },
  large: { width: 1600, height: 1600 },
} as const;
export type ImageVariant = keyof typeof IMAGE_VARIANTS;

/** Default pagination behaviour for list endpoints. */
export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 12,
  maxLimit: 100,
} as const;

/**
 * Cache tags used for Next.js on-demand revalidation. When the API publishes a
 * change it posts the affected tags to the web app, which calls `revalidateTag`.
 */
export const CACHE_TAGS = {
  settings: 'settings',
  navigation: 'navigation',
  homepage: 'homepage',
  pages: 'pages',
  posts: 'posts',
  jobs: 'jobs',
  events: 'events',
  gallery: 'gallery',
  testimonials: 'testimonials',
  faqs: 'faqs',
  caseStudies: 'case-studies',
  industries: 'industries',
  services: 'services',
  team: 'team',
  values: 'values',
  perks: 'perks',
  trust: 'trust',
} as const;
export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
