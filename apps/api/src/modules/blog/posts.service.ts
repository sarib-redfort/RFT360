import { Injectable } from '@nestjs/common';
import { CACHE_TAGS, calculateReadingMinutes, ContentStatus } from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { PublishableCrudService } from '../../common/services/publishable-crud.service';
import { postInclude } from '../../common/prisma-includes';
import { sanitizeRichHtml, stripHtml } from '../../common/utils/sanitize';

/**
 * Blog post service. On top of the standard publishable lifecycle it:
 *  - unpacks the editor's `{content:{json,html}}` into `contentJson` +
 *    server-sanitised `contentHtml`,
 *  - derives an excerpt and reading time when omitted,
 *  - reconnects the tag many-to-many on each write, and
 *  - tracks view counts and serves related posts for the detail page.
 */
@Injectable()
export class PostsService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'post',
      cacheTag: CACHE_TAGS.posts,
      slugSource: 'title',
      searchFields: ['title', 'excerpt'],
      include: postInclude,
      // Latest-blogs block lives on the homepage.
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'publishedAt', order: 'desc' },
    });
  }

  protected override toCreateData(input: Record<string, unknown>) {
    return this.mapPost(input, true);
  }

  protected override toUpdateData(input: Record<string, unknown>) {
    return this.mapPost(input, false);
  }

  /** Maps the API payload onto Prisma columns, handling rich text + tags. */
  private mapPost(input: Record<string, unknown>, isCreate: boolean) {
    const { content, tagIds, excerpt, readingMinutes, ...rest } = input as {
      content?: { json?: unknown; html?: string };
      tagIds?: string[];
      excerpt?: string;
      readingMinutes?: number;
      [key: string]: unknown;
    };

    const data: Record<string, unknown> = { ...rest };

    if (content) {
      const html = sanitizeRichHtml(content.html);
      data.contentJson = content.json ?? undefined;
      data.contentHtml = html;
      data.readingMinutes = readingMinutes ?? calculateReadingMinutes(html);
      data.excerpt = excerpt || stripHtml(html).slice(0, 200);
    } else if (excerpt !== undefined) {
      data.excerpt = excerpt;
    }

    if (tagIds) {
      /*
       * Prisma only accepts `set` on an UPDATE — using it in a create throws a
       * validation error (which surfaced as a 400 whenever the CMS created a
       * post, since the schema defaults `tagIds` to an empty array). Create
       * connects the chosen tags; update replaces the whole list, matching the
       * editor's multi-select.
       */
      const connections = tagIds.map((id) => ({ id }));
      data.tags = isCreate ? { connect: connections } : { set: connections };
    }
    return data;
  }

  /** Public list, newest first, optionally filtered by category/tag slug. */
  async listPublic(
    query: Parameters<PublishableCrudService['publicList']>[0] & {
      category?: string;
      tag?: string;
      featured?: boolean;
    },
  ) {
    const where: Record<string, unknown> = {};
    if (query.category) where.category = { slug: query.category };
    if (query.tag) where.tags = { some: { slug: query.tag } };
    if (query.featured) where.isFeatured = true;
    return this.publicList(query, where);
  }

  /** Fetches a published post by slug and increments its view count. */
  async getPublicBySlug(slug: string) {
    const post = await this.findBySlugOrThrow<{ id: string }>(slug, true);
    // Fire-and-forget; a counter bump must not slow the page.
    void this.prisma.post
      .update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => undefined);
    return { ...post, related: await this.related(post.id) };
  }

  /** Up to three other published posts, sharing a category when possible. */
  private async related(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { categoryId: true },
    });
    return this.prisma.post.findMany({
      where: {
        id: { not: postId },
        status: ContentStatus.PUBLISHED,
        ...(post?.categoryId ? { categoryId: post.categoryId } : {}),
      },
      include: postInclude,
      orderBy: { publishedAt: 'desc' },
      take: 3,
    });
  }
}
