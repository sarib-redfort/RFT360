import { Injectable } from '@nestjs/common';
import {
  CACHE_TAGS,
  ContentStatus,
  HomepageSectionType,
  type HomepageSectionInput,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { PublishableCrudService } from '../../common/services/publishable-crud.service';
import {
  caseStudyInclude,
  coverOnlyInclude,
  imageOnlyInclude,
  logoOnlyInclude,
  photoOnlyInclude,
  postInclude,
} from '../../common/prisma-includes';

/** Published-and-ordered filter reused by every linked-content query. */
const published = { status: ContentStatus.PUBLISHED } as const;
const byOrder = { order: 'asc' } as const;

/**
 * Drives the homepage. Beyond CRUD on the section records, {@link getComposite}
 * resolves each visible section's linked content (services, testimonials,
 * latest blogs, trust elements, …) into one response, so the Next.js homepage
 * renders the entire planner flow from a single cached fetch.
 */
@Injectable()
export class HomepageService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'homepageSection',
      cacheTag: CACHE_TAGS.homepage,
      searchFields: ['name', 'heading'],
      include: { image: coverOnlyInclude.coverImage },
      defaultSort: { field: 'order', order: 'asc' },
    });
  }

  /**
   * The whole homepage in one payload: ordered visible sections, each with the
   * data its `type` needs. Cached in Redis under the `homepage` tag; any content
   * change that touches the homepage invalidates it.
   */
  async getComposite() {
    return this.cached('composite', async () => {
      const sections = await this.prisma.homepageSection.findMany({
        where: { ...published, isVisible: true },
        include: { image: coverOnlyInclude.coverImage },
        orderBy: byOrder,
      });

      const resolved = await Promise.all(
        sections.map(async (section) => ({
          ...section,
          data: await this.resolveSectionData(section.type, section.itemLimit),
        })),
      );
      return { sections: resolved };
    });
  }

  /** Fetches the linked records a section type renders. */
  private async resolveSectionData(type: HomepageSectionType, take: number): Promise<unknown> {
    switch (type) {
      case HomepageSectionType.SERVICES:
        return this.prisma.service.findMany({
          where: published,
          include: imageOnlyInclude,
          orderBy: byOrder,
          take,
        });
      case HomepageSectionType.INDUSTRIES:
        return this.prisma.industry.findMany({
          where: published,
          include: imageOnlyInclude,
          orderBy: byOrder,
          take,
        });
      case HomepageSectionType.WHY_CHOOSE_US:
      case HomepageSectionType.PERKS:
        return this.prisma.perk.findMany({ where: published, orderBy: byOrder, take });
      case HomepageSectionType.VALUES:
        return this.prisma.cultureValue.findMany({ where: published, orderBy: byOrder, take });
      case HomepageSectionType.CASE_STUDIES:
        return this.prisma.caseStudy.findMany({
          where: published,
          include: caseStudyInclude,
          orderBy: byOrder,
          take,
        });
      case HomepageSectionType.TESTIMONIALS:
        return this.prisma.testimonial.findMany({
          where: published,
          include: { avatar: coverOnlyInclude.coverImage },
          orderBy: byOrder,
          take,
        });
      case HomepageSectionType.FAQ:
        return this.prisma.faq.findMany({ where: published, orderBy: byOrder, take });
      case HomepageSectionType.LATEST_BLOGS:
        return this.prisma.post.findMany({
          where: published,
          include: postInclude,
          orderBy: { publishedAt: 'desc' },
          take,
        });
      case HomepageSectionType.TEAM:
        return this.prisma.teamMember.findMany({
          where: published,
          include: photoOnlyInclude,
          orderBy: byOrder,
          take,
        });
      case HomepageSectionType.STATISTICS:
        return this.prisma.statistic.findMany({ where: published, orderBy: byOrder, take });
      case HomepageSectionType.CLIENT_LOGOS:
        return this.prisma.clientLogo.findMany({
          where: { ...published, isClient: true },
          include: logoOnlyInclude,
          orderBy: byOrder,
          take,
        });
      case HomepageSectionType.PARTNER_LOGOS:
        return this.prisma.clientLogo.findMany({
          where: { ...published, isClient: false },
          include: logoOnlyInclude,
          orderBy: byOrder,
          take,
        });
      case HomepageSectionType.CERTIFICATIONS:
        return this.prisma.certification.findMany({
          where: published,
          include: logoOnlyInclude,
          orderBy: byOrder,
          take,
        });
      case HomepageSectionType.AWARDS:
        return this.prisma.award.findMany({
          where: published,
          include: imageOnlyInclude,
          orderBy: byOrder,
          take,
        });
      case HomepageSectionType.EVENTS:
        return this.prisma.event.findMany({
          where: published,
          include: coverOnlyInclude,
          orderBy: { startsAt: 'desc' },
          take,
        });
      case HomepageSectionType.GALLERY:
        return this.prisma.galleryAlbum.findMany({
          where: published,
          include: coverOnlyInclude,
          orderBy: byOrder,
          take,
        });
      // HERO, WHO_WE_ARE, CONTACT_FORM, CTA, RICH_TEXT render from the section's
      // own fields and need no linked records.
      default:
        return null;
    }
  }

  protected override toCreateData(input: HomepageSectionInput | Record<string, unknown>) {
    return this.mapSection(input as Record<string, unknown>);
  }
  protected override toUpdateData(input: Record<string, unknown>) {
    return this.mapSection(input);
  }

  private mapSection(input: Record<string, unknown>) {
    const { body, ...rest } = input as {
      body?: { json?: unknown; html?: string };
      [key: string]: unknown;
    };
    const data: Record<string, unknown> = { ...rest };
    if (body) {
      data.bodyJson = body.json ?? undefined;
      data.bodyHtml = body.html ?? undefined;
    }
    return data;
  }
}
