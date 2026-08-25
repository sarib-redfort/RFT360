/**
 * Idempotent database seed.
 *
 * Safe to run repeatedly: everything upserts on a natural key (slug/email) or is
 * only created when its table is empty, so re-seeding never duplicates rows.
 * Creates the first admin, global settings, navigation, all content types and
 * the planner's homepage sections.
 */
import { Prisma, PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { ContentStatus } from '@rft360/shared';
import * as data from './seed-data';

const prisma = new PrismaClient();

const PUBLISHED = { status: ContentStatus.PUBLISHED, publishedAt: new Date() };

/** Populated by `seedMedia()`; maps a seed image key -> created Media id. */
const mediaIds = new Map<string, string>();

async function main() {
  console.log('🌱 Seeding RFT360 database...\n');

  await seedAdmin();
  await seedMedia();
  await seedSettings();
  await seedNavigation();
  await seedPages();
  await seedCultureAndPerks();
  await seedStatistics();
  await seedServicesAndIndustries();
  await seedDepartmentsAndJobs();
  await seedTeam();
  await seedTestimonialsAndFaqs();
  await seedCaseStudies();
  await seedEvents();
  await seedGallery();
  await seedTrustElements();
  await seedBlog();
  await seedHomepageSections();

  console.log('\n✅ Seed complete.');
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@redfort360.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const name = process.env.SEED_ADMIN_NAME ?? 'RFT360 Administrator';
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash, role: 'SUPER_ADMIN', isActive: true },
  });
  console.log(`  ✓ Admin user (${email})`);
}

/**
 * Creates Media rows for the placeholder imagery. `storageKey` holds an
 * absolute URL, which the web app's media resolver passes straight through —
 * so these render with no local files and can be swapped for real uploads
 * from the CMS at any time.
 */
async function seedMedia() {
  for (const image of data.seedImages) {
    const record = await prisma.media.upsert({
      where: { storageKey: image.url },
      update: {},
      create: {
        type: 'IMAGE',
        storageKey: image.url,
        filename: `${image.key}.jpg`,
        originalName: `${image.key}.jpg`,
        mimeType: 'image/jpeg',
        size: 0,
        alt: image.alt,
        folder: 'seed',
      },
    });
    mediaIds.set(image.key, record.id);
  }
  console.log(`  ✓ Media placeholders (${data.seedImages.length})`);
}

/** Resolves a seed image key to its Media id (undefined when unset). */
function img(key?: string): string | undefined {
  return key ? mediaIds.get(key) : undefined;
}

/**
 * Builds an `update` patch that attaches a seeded image only when one exists.
 * Returning `{}` for unknown keys means re-seeding never nulls out an image an
 * editor picked in the CMS.
 */
function imagePatch(field: string, key?: string): Record<string, string> {
  const id = img(key);
  return id ? { [field]: id } : {};
}

async function seedSettings() {
  // Branding copy that must stay consistent with the shipped defaults. If a
  // settings row already exists these are refreshed, so renames (e.g. dropping
  // a parent-company name) actually reach the live site instead of being
  // stranded in the database. Operational fields below are create-only.
  const branding = {
    siteName: 'RFT 360',
    tagline: 'Building Technology. Growing People. Creating What’s Next.',
    description:
      'RFT 360 brings together technology expertise across Cloud, DevOps, Cybersecurity, HPC, ' +
      'and IT Infrastructure to solve complex challenges for modern businesses.',
    footerText:
      'RFT 360 brings together technology expertise across Cloud, DevOps, Cybersecurity, HPC, ' +
      'and IT Infrastructure to solve complex challenges for modern businesses.',
    copyrightText: `© ${new Date().getFullYear()} RFT 360. All Rights Reserved.`,
    metaTitle: 'RFT 360 — Careers',
    metaDescription:
      'Build what’s next. Build your career at RFT 360 — where technology challenges become ' +
      'opportunities and careers become long-term journeys.',
    contactEmail: 'careers@redfortech.com',
  };

  const existing = await prisma.siteSettings.findFirst();
  if (existing) {
    await prisma.siteSettings.update({ where: { id: existing.id }, data: branding });
    console.log('  ✓ Site settings (branding refreshed)');
    return;
  }
  await prisma.siteSettings.create({
    data: {
      ...branding,
      tagline: 'Build Your Career at RedFort',
      contactEmail: 'careers@redfort360.com',
      contactPhone: '+92 42 1234 5678',
      city: 'Lahore',
      country: 'Pakistan',
      officeHours: 'Mon–Fri, 9:00–18:00 PKT',
      socialLinkedin: 'https://linkedin.com/company/redfort',
    },
  });
  console.log('  ✓ Site settings');
}

async function seedNavigation() {
  for (const item of data.navigationItems) {
    await prisma.navigationItem.upsert({
      where: { id: `nav-${item.order}` },
      update: { label: item.label, href: item.href, order: item.order, location: item.location },
      create: {
        id: `nav-${item.order}`,
        label: item.label,
        href: item.href,
        location: item.location,
        order: item.order,
        status: ContentStatus.PUBLISHED,
      },
    });
  }

  // Footer columns: a parent item per column, links as its children.
  for (const [c, column] of data.footerColumns.entries()) {
    const parentId = `footer-col-${c}`;
    await prisma.navigationItem.upsert({
      where: { id: parentId },
      update: { label: column.label, order: c },
      create: {
        id: parentId,
        label: column.label,
        location: 'FOOTER',
        order: c,
        status: ContentStatus.PUBLISHED,
      },
    });
    for (const [i, child] of column.children.entries()) {
      await prisma.navigationItem.upsert({
        where: { id: `${parentId}-${i}` },
        update: { label: child.label, href: child.href, order: i },
        create: {
          id: `${parentId}-${i}`,
          label: child.label,
          href: child.href,
          location: 'FOOTER',
          parentId,
          order: i,
          status: ContentStatus.PUBLISHED,
        },
      });
    }
  }

  const footerLinks = data.footerColumns.reduce((n, c) => n + c.children.length, 0);
  console.log(
    `  ✓ Navigation (${data.navigationItems.length} header, ` +
      `${data.footerColumns.length} footer columns / ${footerLinks} links)`,
  );
}

async function seedPages() {
  for (const page of data.pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      // Hero copy is shipped default text — refresh it so wording fixes reach
      // existing rows instead of being stranded in the database.
      update: {
        eyebrow: page.eyebrow,
        heading: page.heading,
        headingAccent: (page as { headingAccent?: string }).headingAccent ?? null,
        subheading: page.subheading,
      },
      create: { ...page, ...PUBLISHED },
    });
  }
  console.log(`  ✓ Pages (${data.pages.length})`);
}

async function seedCultureAndPerks() {
  await upsertOrdered('cultureValue', data.cultureValues, (v) => v.title);
  await upsertOrdered('perk', data.perks, (v) => v.title);
  console.log(`  ✓ Culture values (${data.cultureValues.length}) & perks (${data.perks.length})`);
}

async function seedStatistics() {
  await upsertOrdered('statistic', data.statistics, (v) => v.label);
  console.log(`  ✓ Statistics (${data.statistics.length})`);
}

async function seedServicesAndIndustries() {
  for (const [i, service] of data.services.entries()) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: { ...service },
      create: { ...service, order: i, ...PUBLISHED },
    });
  }
  for (const [i, industry] of data.industries.entries()) {
    await prisma.industry.upsert({
      where: { slug: industry.slug },
      update: { ...industry },
      create: { ...industry, order: i, ...PUBLISHED },
    });
  }

  /*
   * These two lists are shipped content keyed by SLUG, so renaming an entry
   * creates a new row instead of replacing the old one. Left alone, a rename
   * leaves both versions in the database competing for the same `order`, and
   * the homepage renders an interleaved mix of old and new under `itemLimit`.
   * Pruning makes the seed authoritative for what it ships.
   *
   * NOTE: this removes services/industries added through the CMS. Add those
   * back here if they should survive a re-seed.
   */
  const removedServices = await prisma.service.deleteMany({
    where: { slug: { notIn: data.services.map((s) => s.slug) } },
  });
  const removedIndustries = await prisma.industry.deleteMany({
    where: { slug: { notIn: data.industries.map((s) => s.slug) } },
  });

  const pruned = removedServices.count + removedIndustries.count;
  console.log(
    `  ✓ Services (${data.services.length}) & industries (${data.industries.length})` +
      (pruned > 0 ? ` — pruned ${pruned} superseded` : ''),
  );
}

async function seedDepartmentsAndJobs() {
  const deptIdBySlug = new Map<string, string>();
  for (const [i, dept] of data.departments.entries()) {
    const record = await prisma.department.upsert({
      where: { slug: dept.slug },
      update: {},
      create: { ...dept, order: i, status: ContentStatus.PUBLISHED },
    });
    deptIdBySlug.set(dept.slug, record.id);
  }

  for (const [i, job] of data.jobs.entries()) {
    const { departmentSlug, ...rest } = job;
    await prisma.job.upsert({
      where: { slug: job.slug },
      update: {},
      create: {
        ...rest,
        departmentId: deptIdBySlug.get(departmentSlug),
        order: i,
        ...PUBLISHED,
      },
    });
  }
  console.log(`  ✓ Departments (${data.departments.length}) & jobs (${data.jobs.length})`);
}

async function seedTeam() {
  for (const [i, member] of data.teamMembers.entries()) {
    await prisma.teamMember.upsert({
      where: { id: `team-${i}` },
      update: { ...member },
      create: { id: `team-${i}`, ...member, order: i, ...PUBLISHED },
    });
  }
  console.log(`  ✓ Team members (${data.teamMembers.length})`);
}

async function seedTestimonialsAndFaqs() {
  for (const [i, t] of data.testimonials.entries()) {
    await prisma.testimonial.upsert({
      where: { id: `testimonial-${i}` },
      update: { ...t },
      create: { id: `testimonial-${i}`, ...t, order: i, ...PUBLISHED },
    });
  }
  for (const [i, f] of data.faqs.entries()) {
    await prisma.faq.upsert({
      where: { id: `faq-${i}` },
      // FAQ text is shipped copy, so re-seeding refreshes it — otherwise a
      // wording change stays stranded in the database.
      update: { question: f.question, answer: f.answer, category: f.category },
      create: { id: `faq-${i}`, ...f, order: i, ...PUBLISHED },
    });
  }
  console.log(`  ✓ Testimonials (${data.testimonials.length}) & FAQs (${data.faqs.length})`);
}

async function seedCaseStudies() {
  for (const [i, cs] of data.caseStudies.entries()) {
    const { imageKey, ...rest } = cs as typeof cs & { imageKey?: string };
    await prisma.caseStudy.upsert({
      where: { slug: cs.slug },
      update: imagePatch('coverImageId', imageKey),
      create: { ...rest, coverImageId: img(imageKey), order: i, ...PUBLISHED },
    });
  }
  console.log(`  ✓ Case studies (${data.caseStudies.length})`);
}

async function seedEvents() {
  for (const [i, ev] of data.events.entries()) {
    const { daysFromNow, imageKey, ...rest } = ev as typeof ev & { imageKey?: string };
    const startsAt = new Date(Date.now() + daysFromNow * 86400_000);
    const eventStatus = daysFromNow < 0 ? 'COMPLETED' : daysFromNow < 3 ? 'ONGOING' : 'UPCOMING';
    await prisma.event.upsert({
      where: { slug: ev.slug },
      update: imagePatch('coverImageId', imageKey),
      create: {
        ...rest,
        startsAt,
        coverImageId: img(imageKey),
        eventStatus: eventStatus as never,
        order: i,
        ...PUBLISHED,
      },
    });
  }
  console.log(`  ✓ Events (${data.events.length})`);
}

async function seedGallery() {
  for (const [i, album] of data.galleryAlbums.entries()) {
    const { imageKey, photoKeys, ...rest } = album as typeof album & {
      imageKey?: string;
      photoKeys?: string[];
    };
    const record = await prisma.galleryAlbum.upsert({
      where: { slug: album.slug },
      update: imagePatch('coverImageId', imageKey),
      create: { ...rest, coverImageId: img(imageKey), order: i, ...PUBLISHED },
    });

    // Attach photos, skipping any already linked so re-seeding is idempotent.
    for (const [j, key] of (photoKeys ?? []).entries()) {
      const mediaId = img(key);
      if (!mediaId) continue;
      const exists = await prisma.galleryImage.findFirst({
        where: { albumId: record.id, mediaId },
      });
      if (!exists) {
        await prisma.galleryImage.create({
          data: { albumId: record.id, mediaId, order: j },
        });
      }
    }
  }
  console.log(`  ✓ Gallery albums (${data.galleryAlbums.length}) with photos`);
}

async function seedTrustElements() {
  await upsertOrdered('certification', data.certifications, (v) => v.name);
  await upsertOrdered('award', data.awards, (v) => v.title);
  console.log(
    `  ✓ Certifications (${data.certifications.length}) & awards (${data.awards.length})`,
  );
}

async function seedBlog() {
  const catIdBySlug = new Map<string, string>();
  for (const [i, cat] of data.postCategories.entries()) {
    const record = await prisma.postCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, order: i, status: ContentStatus.PUBLISHED },
    });
    catIdBySlug.set(cat.slug, record.id);
  }

  const tagIdBySlug = new Map<string, string>();
  for (const tag of data.tags) {
    const record = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    tagIdBySlug.set(tag.slug, record.id);
  }

  const author = await prisma.teamMember.findFirst({ where: { isLeadership: true } });

  for (const [i, post] of data.posts.entries()) {
    const { categorySlug, tagSlugs, imageKey, ...rest } = post as typeof post & {
      imageKey?: string;
    };
    const words = rest.contentHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: imagePatch('coverImageId', imageKey),
      create: {
        ...rest,
        categoryId: catIdBySlug.get(categorySlug),
        authorId: author?.id,
        coverImageId: img(imageKey),
        readingMinutes: Math.max(1, Math.round(words / 200)),
        order: i,
        tags: { connect: tagSlugs.map((slug) => ({ id: tagIdBySlug.get(slug)! })) },
        ...PUBLISHED,
      },
    });
  }
  console.log(
    `  ✓ Blog: ${data.postCategories.length} categories, ${data.tags.length} tags, ${data.posts.length} posts`,
  );
}

async function seedHomepageSections() {
  for (const [i, section] of data.homepageSections.entries()) {
      const copy = {
        name: section.name,
        eyebrow: section.eyebrow ?? null,
        heading: section.heading ?? null,
        headingAccent: section.headingAccent ?? null,
        subheading: section.subheading ?? null,
        bodyHtml: (section as { bodyHtml?: string }).bodyHtml ?? null,
        itemLimit: section.itemLimit ?? 6,
        ctaPrimary: section.ctaPrimary ?? Prisma.DbNull,
        ctaSecondary: section.ctaSecondary ?? Prisma.DbNull,
        // Sections absent from the shipped content are hidden, not deleted, so
        // they can be switched back on in the CMS without re-creating them.
        isVisible: (section as { isVisible?: boolean }).isVisible ?? true,
      };

      await prisma.homepageSection.upsert({
        where: { id: `section-${section.type}` },
        /*
         * Section content is a shipped default, so re-seeding refreshes ALL of
         * it: copy, CTAs, item limits and visibility. Refreshing only some
         * fields (as this previously did) leaves a half-updated section, e.g. a
         * new heading above a stale call-to-action.
         *
         * NOTE: a re-seed therefore resets homepage copy edited in the CMS. Do
         * your final seed first, then customise in Admin -> Homepage.
         */
        update: {
          ...copy,
          ...imagePatch('imageId', (section as { imageKey?: string }).imageKey),
        },
        create: {
          id: `section-${section.type}`,
          type: section.type,
          ...copy,
          imageId: img((section as { imageKey?: string }).imageKey),
          order: i,
          ...PUBLISHED,
        },
      });
  }
  console.log(`  ✓ Homepage sections (${data.homepageSections.length}, planner order)`);
}

/**
 * Upserts an ordered list of simple content records keyed by a synthetic
 * `<model>-<index>` id, so re-seeding updates rather than duplicates.
 */
async function upsertOrdered<T extends Record<string, unknown>>(
  model: string,
  items: T[],
  _label: (item: T) => string,
) {
  const delegate = (prisma as unknown as Record<string, {
    upsert: (args: unknown) => Promise<unknown>;
  }>)[model];
  for (const [i, item] of items.entries()) {
    const id = `${model}-${i}`;
    await delegate.upsert({
      where: { id },
      update: { ...item },
      create: { id, ...item, order: i, ...PUBLISHED },
    });
  }
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
