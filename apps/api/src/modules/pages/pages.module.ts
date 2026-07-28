import { Controller, Injectable, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CACHE_TAGS, pageSchema, Role, updatePageSchema } from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { PublishableCrudService } from '../../common/services/publishable-crud.service';
import { AbstractAdminCrudController } from '../../common/controllers/abstract-admin-crud.controller';
import { AbstractPublicCrudController } from '../../common/controllers/abstract-public-crud.controller';
import { Roles } from '../../common/decorators/roles.decorator';
import { coverOnlyInclude } from '../../common/prisma-includes';
import { mapRichText } from '../../common/utils/rich-text';

/**
 * Static pages (About Culture, Life at RedFort, Contact, …). Holds each page's
 * hero copy, SEO overrides and optional rich-text body. `body` and `seo` are
 * flattened onto their Prisma columns on write.
 */
@Injectable()
export class PagesService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'page',
      cacheTag: CACHE_TAGS.pages,
      slugSource: 'title',
      searchFields: ['title', 'heading', 'slug'],
      include: { heroImage: coverOnlyInclude.coverImage },
      defaultSort: { field: 'order', order: 'asc' },
    });
  }

  protected override toCreateData(input: Record<string, unknown>) {
    return this.mapPage(input);
  }
  protected override toUpdateData(input: Record<string, unknown>) {
    return this.mapPage(input);
  }

  private mapPage(input: Record<string, unknown>) {
    const withBody = mapRichText(input, 'body');
    const { seo, ...rest } = withBody as { seo?: Record<string, unknown>; [k: string]: unknown };
    // SEO is a nested object in the payload but flat columns in the DB.
    return seo ? { ...rest, ...seo } : rest;
  }
}

@ApiTags('Public · Pages')
@Controller('pages')
export class PublicPagesController extends AbstractPublicCrudController {
  constructor(protected readonly service: PagesService) {
    super();
  }
}

@ApiTags('Admin · Pages')
@Controller('admin/pages')
@Roles(Role.EDITOR)
export class AdminPagesController extends AbstractAdminCrudController {
  protected readonly createSchema = pageSchema;
  protected readonly updateSchema = updatePageSchema;
  constructor(protected readonly service: PagesService) {
    super();
  }
}

@Module({
  controllers: [PublicPagesController, AdminPagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
