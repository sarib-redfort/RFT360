/**
 * Reusable Prisma `include`/`select` fragments.
 *
 * Keeps read shapes consistent across services and avoids returning oversized
 * media rows — list/detail endpoints only need enough of a `Media` record to
 * render an image, not its full metadata.
 */

/** The image fields the web app needs to render a responsive picture. */
export const mediaSelect = {
  select: {
    id: true,
    storageKey: true,
    filename: true,
    mimeType: true,
    alt: true,
    caption: true,
    width: true,
    height: true,
    variants: true,
    blurDataUrl: true,
  },
} as const;

export const authorSelect = {
  select: {
    id: true,
    name: true,
    role: true,
    photo: mediaSelect,
  },
} as const;

export const postInclude = {
  coverImage: mediaSelect,
  category: { select: { id: true, name: true, slug: true, color: true } },
  author: authorSelect,
  tags: { select: { id: true, name: true, slug: true } },
} as const;

export const jobInclude = {
  department: { select: { id: true, name: true, slug: true, icon: true } },
} as const;

export const eventInclude = {
  coverImage: mediaSelect,
} as const;

export const galleryAlbumInclude = {
  coverImage: mediaSelect,
  images: {
    orderBy: { order: 'asc' as const },
    include: { media: mediaSelect },
  },
} as const;

export const caseStudyInclude = {
  coverImage: mediaSelect,
  industry: { select: { id: true, name: true, slug: true } },
} as const;

export const imageOnlyInclude = { image: mediaSelect } as const;
export const photoOnlyInclude = { photo: mediaSelect } as const;
export const logoOnlyInclude = { logo: mediaSelect } as const;
export const coverOnlyInclude = { coverImage: mediaSelect } as const;
