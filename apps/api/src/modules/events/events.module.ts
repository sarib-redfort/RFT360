import { Injectable, Module } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CACHE_TAGS, eventSchema, Role, updateEventSchema } from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { PublishableCrudService } from '../../common/services/publishable-crud.service';
import { AbstractAdminCrudController } from '../../common/controllers/abstract-admin-crud.controller';
import { AbstractPublicCrudController } from '../../common/controllers/abstract-public-crud.controller';
import { Roles } from '../../common/decorators/roles.decorator';
import { eventInclude } from '../../common/prisma-includes';
import { sanitizeRichHtml } from '../../common/utils/sanitize';

/** Company events — publishable, ordered by start date, with rich-text detail. */
@Injectable()
export class EventsService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'event',
      cacheTag: CACHE_TAGS.events,
      slugSource: 'title',
      searchFields: ['title', 'summary', 'location'],
      include: eventInclude,
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'startsAt', order: 'desc' },
    });
  }

  protected override toCreateData(input: Record<string, unknown>) {
    return this.mapEvent(input);
  }
  protected override toUpdateData(input: Record<string, unknown>) {
    return this.mapEvent(input);
  }

  private mapEvent(input: Record<string, unknown>) {
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
}

@ApiTags('Public · Events')
@Controller('events')
export class PublicEventsController extends AbstractPublicCrudController {
  constructor(protected readonly service: EventsService) {
    super();
  }
}

@ApiTags('Admin · Events')
@Controller('admin/events')
@Roles(Role.EDITOR)
export class AdminEventsController extends AbstractAdminCrudController {
  protected readonly createSchema = eventSchema;
  protected readonly updateSchema = updateEventSchema;
  constructor(protected readonly service: EventsService) {
    super();
  }
}

@Module({
  controllers: [PublicEventsController, AdminEventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
