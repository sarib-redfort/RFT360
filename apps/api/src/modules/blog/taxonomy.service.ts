import { Injectable } from '@nestjs/common';
import { CACHE_TAGS, slugify } from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { PublishableCrudService } from '../../common/services/publishable-crud.service';

/** Blog categories (publishable, ordered, with a colour swatch). */
@Injectable()
export class CategoriesService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'postCategory',
      cacheTag: CACHE_TAGS.posts,
      slugSource: 'name',
      searchFields: ['name'],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
}

/**
 * Blog tags. Simpler than the publishable entities — no status column — so it
 * uses Prisma directly rather than the publishable base.
 */
@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidation: RevalidationService,
  ) {}

  list() {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }

  async create(input: { name: string; slug?: string }) {
    // Tags don't extend PublishableCrudService, so derive the slug here to
    // match the auto-generation every other content type gets.
    const tag = await this.prisma.tag.create({
      data: { name: input.name, slug: input.slug || slugify(input.name) },
    });
    await this.revalidation.revalidate([CACHE_TAGS.posts]);
    return tag;
  }

  async update(id: string, input: Partial<{ name: string; slug?: string }>) {
    const tag = await this.prisma.tag.update({ where: { id }, data: input });
    await this.revalidation.revalidate([CACHE_TAGS.posts]);
    return tag;
  }

  async remove(id: string) {
    await this.prisma.tag.delete({ where: { id } });
    await this.revalidation.revalidate([CACHE_TAGS.posts]);
    return { id };
  }
}
