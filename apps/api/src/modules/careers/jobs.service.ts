import { Injectable } from '@nestjs/common';
import { CACHE_TAGS } from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { PublishableCrudService } from '../../common/services/publishable-crud.service';
import { jobInclude } from '../../common/prisma-includes';
import { sanitizeRichHtml } from '../../common/utils/sanitize';

/** Job openings — publishable, with a rich-text description and filters. */
@Injectable()
export class JobsService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'job',
      cacheTag: CACHE_TAGS.jobs,
      slugSource: 'title',
      searchFields: ['title', 'location', 'summary'],
      include: jobInclude,
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }

  protected override toCreateData(input: Record<string, unknown>) {
    return this.mapJob(input);
  }
  protected override toUpdateData(input: Record<string, unknown>) {
    return this.mapJob(input);
  }

  private mapJob(input: Record<string, unknown>) {
    const { description, ...rest } = input as {
      description?: { json?: unknown; html?: string };
      [key: string]: unknown;
    };
    const data: Record<string, unknown> = { ...rest };
    if (description) {
      data.descriptionJson = description.json ?? undefined;
      data.descriptionHtml = sanitizeRichHtml(description.html);
    }
    return data;
  }

  /** Public list with optional department/type/mode filters. */
  async listPublic(
    query: Parameters<PublishableCrudService['publicList']>[0] & {
      department?: string;
      employmentType?: string;
      workMode?: string;
    },
  ) {
    const where: Record<string, unknown> = {};
    if (query.department) where.department = { slug: query.department };
    if (query.employmentType) where.employmentType = query.employmentType;
    if (query.workMode) where.workMode = query.workMode;
    return this.publicList(query, where);
  }
}

/** Departments — publishable, used to group jobs and team members. */
@Injectable()
export class DepartmentsService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'department',
      cacheTag: CACHE_TAGS.jobs,
      slugSource: 'name',
      searchFields: ['name'],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
}
