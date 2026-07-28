import { BadRequestException } from '@nestjs/common';
import {
  ContentStatus,
  slugify,
  type CacheTag,
  type ListQueryInput,
  type PaginatedResult,
  type ReorderInput,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RevalidationService } from '../../modules/revalidation/revalidation.service';
import { BaseCrudService, type BaseCrudOptions } from './base-crud.service';

export interface PublishableOptions extends BaseCrudOptions {
  /** Cache tags dropped + revalidated whenever a record changes. */
  cacheTag: CacheTag;
  /** Field a slug is derived from when the payload omits one (e.g. 'title'). */
  slugSource?: string;
  /** Extra tags to revalidate (e.g. the homepage when a testimonial changes). */
  extraRevalidateTags?: CacheTag[];
}

/**
 * Full write lifecycle for a publishable content entity.
 *
 * Extends {@link BaseCrudService} (list/read) with create, update, delete,
 * status transitions and drag-and-drop reordering. Cross-cutting concerns are
 * centralised here so the ~25 concrete services stay tiny:
 *  - slugs are auto-generated and de-duplicated,
 *  - `publishedAt` is stamped on the first transition to PUBLISHED,
 *  - every mutation invalidates the API cache and pings Next.js to revalidate,
 *  - concrete services only override {@link toCreateData}/{@link toUpdateData}
 *    to map their input shape (rich text, relations) onto Prisma columns.
 */
export abstract class PublishableCrudService extends BaseCrudService {
  protected constructor(
    prisma: PrismaService,
    protected readonly redis: RedisService,
    protected readonly revalidation: RevalidationService,
    protected override readonly options: PublishableOptions,
  ) {
    super(prisma, options);
  }

  /**
   * Maps a validated create payload to Prisma `create` data. Default is a
   * pass-through; override to unpack rich text, connect relations, etc.
   */
  protected toCreateData(input: Record<string, unknown>): Record<string, unknown> {
    return input;
  }

  /** As {@link toCreateData}, for updates. */
  protected toUpdateData(input: Record<string, unknown>): Record<string, unknown> {
    return input;
  }

  async create(input: Record<string, unknown>, actorId?: string) {
    const data = this.toCreateData({ ...input });
    if (this.options.slugSource) {
      data.slug = await this.ensureUniqueSlug(
        (input.slug as string) || slugify(String(input[this.options.slugSource] ?? '')),
      );
    }
    this.stampPublish(data, input.status as ContentStatus | undefined);
    if (actorId) data.createdById = actorId;

    const record = await this.delegate.create({ data, include: this.options.include });
    await this.afterMutation();
    return record;
  }

  async update(id: string, input: Record<string, unknown>, actorId?: string) {
    await this.findByIdOrThrow(id);
    const data = this.toUpdateData({ ...input });

    if (this.options.slugSource && typeof input.slug === 'string' && input.slug) {
      data.slug = await this.ensureUniqueSlug(input.slug, id);
    }
    this.stampPublish(data, input.status as ContentStatus | undefined);
    if (actorId) data.updatedById = actorId;

    const record = await this.delegate.update({
      where: { id },
      data,
      include: this.options.include,
    });
    await this.afterMutation();
    return record;
  }

  async setStatus(id: string, status: ContentStatus, actorId?: string) {
    await this.findByIdOrThrow(id);
    const data: Record<string, unknown> = { status, updatedById: actorId };
    if (status === ContentStatus.PUBLISHED) data.publishedAt = new Date();
    const record = await this.delegate.update({
      where: { id },
      data,
      include: this.options.include,
    });
    await this.afterMutation();
    return record;
  }

  override async removeById(id: string) {
    const result = await super.removeById(id);
    await this.afterMutation();
    return result;
  }

  /** Persists a new manual order for a set of records, in one transaction. */
  async reorder(input: ReorderInput) {
    const updates = input.items.map((item) =>
      (this.delegate.update as (args: unknown) => unknown)({
        where: { id: item.id },
        data: { order: item.order },
      }),
    );
    // The delegate returns real PrismaPromises at runtime; the base interface
    // widens the type, so assert back to what $transaction expects.
    await this.prisma.$transaction(updates as never);
    await this.afterMutation();
    return { success: true };
  }

  /** Sets `publishedAt` the first time a record becomes PUBLISHED. */
  protected stampPublish(data: Record<string, unknown>, status?: ContentStatus) {
    if (status === ContentStatus.PUBLISHED && data.publishedAt == null) {
      data.publishedAt = new Date();
    }
  }

  /** Appends a numeric suffix until the slug is unique within the model. */
  protected async ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
    const clean = slugify(base);
    if (!clean) throw new BadRequestException('Could not derive a valid slug');
    let candidate = clean;
    let suffix = 2;
    // Loop is bounded in practice; slugs collide rarely.
    while (true) {
      const existing = (await this.delegate.findFirst({
        where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      })) as { id: string } | null;
      if (!existing) return candidate;
      candidate = `${clean}-${suffix++}`;
    }
  }

  /** Drops caches and triggers Next.js revalidation for this entity's tags. */
  protected async afterMutation() {
    const tags = [this.options.cacheTag, ...(this.options.extraRevalidateTags ?? [])];
    await this.revalidation.revalidate(tags);
  }

  /** Wraps a read in the Redis cache using this entity's tag. */
  protected cached<T>(key: string, factory: () => Promise<T>, ttl = 300): Promise<T> {
    return this.redis.remember(`${this.options.model}:${key}`, ttl, [this.options.cacheTag], factory);
  }

  /** Convenience used by public endpoints that must 404 on unpublished. */
  async publicList<T>(query: ListQueryInput, extraWhere: Record<string, unknown> = {}) {
    return this.list<T>(query, true, extraWhere) as Promise<PaginatedResult<T>>;
  }
}
