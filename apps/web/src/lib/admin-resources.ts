/**
 * CMS resource registry.
 *
 * One entry per editable content type drives the generic admin list + form, so
 * ~28 entities share a single UI. Complex types (posts, jobs, homepage
 * sections, pages) declare rich fields (Tiptap, media, arrays) here and are
 * rendered by the same generic form. Truly bespoke areas (media library,
 * submissions, settings, navigation) have their own pages and are not listed
 * here.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'slug'
  | 'number'
  | 'boolean'
  | 'select'
  | 'date'
  | 'datetime'
  | 'media'
  | 'string-array'
  | 'tags'
  | 'relation'
  | 'results'
  | 'cta'
  | 'icon';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  /** For `relation`/`tags`: admin endpoint returning selectable records. */
  optionsEndpoint?: string;
  /** Field derives its default slug from this sibling field. */
  slugFrom?: string;
  /** Layout width in a 2-col grid. */
  full?: boolean;
}

export interface ResourceConfig {
  key: string;
  /** Admin API path (…/admin/<path>). */
  path: string;
  label: string;
  labelSingular: string;
  icon: string;
  group: 'Content' | 'Careers' | 'People & Culture' | 'Trust' | 'Structure';
  /** Fields shown as columns in the list table. */
  listColumns: { field: string; label: string }[];
  /** Whether the entity supports the publish workflow. */
  publishable?: boolean;
  /** Whether the entity supports drag reordering. */
  orderable?: boolean;
  fields: FieldConfig[];
}

const statusColumn = { field: 'status', label: 'Status' };

export const RESOURCES: ResourceConfig[] = [
  // ── Content ───────────────────────────────────────────────────────────────
  {
    key: 'posts',
    path: 'posts',
    label: 'Blog Posts',
    labelSingular: 'Post',
    icon: 'fa-solid fa-newspaper',
    group: 'Content',
    publishable: true,
    listColumns: [{ field: 'title', label: 'Title' }, statusColumn],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug', slugFrom: 'title' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', full: true },
      { name: 'coverImageId', label: 'Cover image', type: 'media' },
      { name: 'categoryId', label: 'Category', type: 'relation', optionsEndpoint: '/admin/post-categories' },
      { name: 'authorId', label: 'Author', type: 'relation', optionsEndpoint: '/admin/team' },
      { name: 'tagIds', label: 'Tags', type: 'tags', optionsEndpoint: '/admin/tags' },
      { name: 'isFeatured', label: 'Featured', type: 'boolean' },
      { name: 'content', label: 'Content', type: 'richtext', full: true },
    ],
  },
  {
    key: 'case-studies',
    path: 'case-studies',
    label: 'Success Stories',
    labelSingular: 'Success Story',
    icon: 'fa-solid fa-trophy',
    group: 'Content',
    publishable: true,
    orderable: true,
    listColumns: [{ field: 'title', label: 'Title' }, statusColumn],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug', slugFrom: 'title' },
      { name: 'subtitle', label: 'Subtitle', type: 'text' },
      { name: 'clientName', label: 'Person / Team', type: 'text' },
      { name: 'summary', label: 'Summary', type: 'textarea', full: true },
      { name: 'coverImageId', label: 'Cover image', type: 'media' },
      { name: 'industryId', label: 'Industry', type: 'relation', optionsEndpoint: '/admin/industries' },
      { name: 'results', label: 'Key results', type: 'results', full: true },
      { name: 'content', label: 'Content', type: 'richtext', full: true },
    ],
  },
  {
    key: 'events',
    path: 'events',
    label: 'Events',
    labelSingular: 'Event',
    icon: 'fa-solid fa-calendar-days',
    group: 'Content',
    publishable: true,
    listColumns: [{ field: 'title', label: 'Title' }, statusColumn],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug', slugFrom: 'title' },
      { name: 'summary', label: 'Summary', type: 'textarea', full: true },
      { name: 'startsAt', label: 'Starts at', type: 'datetime', required: true },
      { name: 'endsAt', label: 'Ends at', type: 'datetime' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'coverImageId', label: 'Cover image', type: 'media' },
      { name: 'isFeatured', label: 'Featured', type: 'boolean' },
      { name: 'description', label: 'Description', type: 'richtext', full: true },
    ],
  },
  // ── Careers ─────────────────────────────────────────────────────────────
  {
    key: 'jobs',
    path: 'jobs',
    label: 'Jobs',
    labelSingular: 'Job',
    icon: 'fa-solid fa-briefcase',
    group: 'Careers',
    publishable: true,
    listColumns: [{ field: 'title', label: 'Title' }, { field: 'location', label: 'Location' }, statusColumn],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug', slugFrom: 'title' },
      { name: 'departmentId', label: 'Department', type: 'relation', optionsEndpoint: '/admin/departments' },
      { name: 'location', label: 'Location', type: 'text', required: true },
      {
        name: 'employmentType',
        label: 'Employment type',
        type: 'select',
        options: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'].map((v) => ({ label: v, value: v })),
      },
      {
        name: 'workMode',
        label: 'Work mode',
        type: 'select',
        options: ['ONSITE', 'HYBRID', 'REMOTE'].map((v) => ({ label: v, value: v })),
      },
      {
        name: 'experienceLevel',
        label: 'Experience',
        type: 'select',
        options: ['INTERNSHIP', 'ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'].map((v) => ({ label: v, value: v })),
      },
      { name: 'summary', label: 'Summary', type: 'textarea', full: true },
      { name: 'responsibilities', label: 'Responsibilities', type: 'string-array', full: true },
      { name: 'requirements', label: 'Requirements', type: 'string-array', full: true },
      { name: 'niceToHave', label: 'Nice to have', type: 'string-array', full: true },
      { name: 'benefits', label: 'Benefits', type: 'string-array', full: true },
      { name: 'skills', label: 'Skills', type: 'string-array', full: true },
      { name: 'isFeatured', label: 'Featured', type: 'boolean' },
      { name: 'description', label: 'Full description', type: 'richtext', full: true },
    ],
  },
  {
    key: 'departments',
    path: 'departments',
    label: 'Departments',
    labelSingular: 'Department',
    icon: 'fa-solid fa-sitemap',
    group: 'Careers',
    publishable: true,
    orderable: true,
    listColumns: [{ field: 'name', label: 'Name' }, statusColumn],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug', slugFrom: 'name' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'icon', label: 'Icon', type: 'icon' },
    ],
  },
  // ── People & Culture ──────────────────────────────────────────────────────
  {
    key: 'team',
    path: 'team',
    label: 'Team',
    labelSingular: 'Team Member',
    icon: 'fa-solid fa-user-group',
    group: 'People & Culture',
    publishable: true,
    orderable: true,
    listColumns: [{ field: 'name', label: 'Name' }, { field: 'role', label: 'Role' }, statusColumn],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text', required: true },
      { name: 'departmentId', label: 'Department', type: 'relation', optionsEndpoint: '/admin/departments' },
      { name: 'photoId', label: 'Photo', type: 'media' },
      { name: 'isLeadership', label: 'Leadership', type: 'boolean' },
      { name: 'linkedinUrl', label: 'LinkedIn', type: 'text' },
      { name: 'bio', label: 'Bio', type: 'textarea', full: true },
    ],
  },
  {
    key: 'culture-values',
    path: 'culture-values',
    label: 'Culture Values',
    labelSingular: 'Value',
    icon: 'fa-solid fa-heart',
    group: 'People & Culture',
    publishable: true,
    orderable: true,
    listColumns: [{ field: 'title', label: 'Title' }, statusColumn],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'description', label: 'Description', type: 'textarea', full: true, required: true },
    ],
  },
  {
    key: 'perks',
    path: 'perks',
    label: 'Perks & Benefits',
    labelSingular: 'Perk',
    icon: 'fa-solid fa-gift',
    group: 'People & Culture',
    publishable: true,
    orderable: true,
    listColumns: [{ field: 'title', label: 'Title' }, statusColumn],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'description', label: 'Description', type: 'textarea', full: true, required: true },
    ],
  },
  {
    key: 'testimonials',
    path: 'testimonials',
    label: 'Testimonials',
    labelSingular: 'Testimonial',
    icon: 'fa-solid fa-quote-left',
    group: 'People & Culture',
    publishable: true,
    orderable: true,
    listColumns: [{ field: 'authorName', label: 'Author' }, statusColumn],
    fields: [
      { name: 'authorName', label: 'Author name', type: 'text', required: true },
      { name: 'authorRole', label: 'Author role', type: 'text' },
      { name: 'avatarId', label: 'Avatar', type: 'media' },
      { name: 'rating', label: 'Rating (1–5)', type: 'number' },
      { name: 'isFeatured', label: 'Featured', type: 'boolean' },
      { name: 'quote', label: 'Quote', type: 'textarea', full: true, required: true },
    ],
  },
  // ── Content: capabilities ─────────────────────────────────────────────────
  {
    key: 'services',
    path: 'services',
    label: 'Teams / Services',
    labelSingular: 'Service',
    icon: 'fa-solid fa-layer-group',
    group: 'Content',
    publishable: true,
    orderable: true,
    listColumns: [{ field: 'title', label: 'Title' }, statusColumn],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug', slugFrom: 'title' },
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'shortDescription', label: 'Short description', type: 'textarea', full: true },
      { name: 'features', label: 'Features', type: 'string-array', full: true },
      { name: 'isFeatured', label: 'Featured', type: 'boolean' },
    ],
  },
  {
    key: 'industries',
    path: 'industries',
    label: 'Industries',
    labelSingular: 'Industry',
    icon: 'fa-solid fa-city',
    group: 'Content',
    publishable: true,
    orderable: true,
    listColumns: [{ field: 'name', label: 'Name' }, statusColumn],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug', slugFrom: 'name' },
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
    ],
  },
  {
    key: 'faqs',
    path: 'faqs',
    label: 'FAQs',
    labelSingular: 'FAQ',
    icon: 'fa-solid fa-circle-question',
    group: 'Content',
    publishable: true,
    orderable: true,
    listColumns: [{ field: 'question', label: 'Question' }, statusColumn],
    fields: [
      { name: 'question', label: 'Question', type: 'text', required: true, full: true },
      { name: 'answer', label: 'Answer', type: 'textarea', required: true, full: true },
      { name: 'category', label: 'Category', type: 'text' },
    ],
  },
  // ── Trust ─────────────────────────────────────────────────────────────────
  {
    key: 'statistics',
    path: 'statistics',
    label: 'Statistics',
    labelSingular: 'Statistic',
    icon: 'fa-solid fa-chart-simple',
    group: 'Trust',
    publishable: true,
    orderable: true,
    listColumns: [{ field: 'label', label: 'Label' }, { field: 'value', label: 'Value' }],
    fields: [
      { name: 'value', label: 'Value (e.g. 250+)', type: 'text', required: true },
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'icon', label: 'Icon', type: 'icon' },
    ],
  },
  {
    key: 'certifications',
    path: 'certifications',
    label: 'Certifications',
    labelSingular: 'Certification',
    icon: 'fa-solid fa-certificate',
    group: 'Trust',
    publishable: true,
    orderable: true,
    listColumns: [{ field: 'name', label: 'Name' }],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'issuer', label: 'Issuer', type: 'text' },
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'logoId', label: 'Logo', type: 'media' },
    ],
  },
  {
    key: 'awards',
    path: 'awards',
    label: 'Awards',
    labelSingular: 'Award',
    icon: 'fa-solid fa-medal',
    group: 'Trust',
    publishable: true,
    orderable: true,
    listColumns: [{ field: 'title', label: 'Title' }],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'issuer', label: 'Issuer', type: 'text' },
      { name: 'icon', label: 'Icon', type: 'icon' },
    ],
  },
  {
    key: 'client-logos',
    path: 'client-logos',
    label: 'Client / Partner Logos',
    labelSingular: 'Logo',
    icon: 'fa-solid fa-building',
    group: 'Trust',
    publishable: true,
    orderable: true,
    listColumns: [{ field: 'name', label: 'Name' }],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'logoId', label: 'Logo', type: 'media' },
      { name: 'websiteUrl', label: 'Website', type: 'text' },
      { name: 'isClient', label: 'Is client (else partner)', type: 'boolean' },
    ],
  },
];

export function getResource(key: string): ResourceConfig | undefined {
  return RESOURCES.find((r) => r.key === key);
}

export const RESOURCE_GROUPS = ['Content', 'Careers', 'People & Culture', 'Trust', 'Structure'] as const;
