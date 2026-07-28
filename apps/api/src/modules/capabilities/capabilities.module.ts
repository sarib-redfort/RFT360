import { Controller, Injectable, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CACHE_TAGS,
  industrySchema,
  Role,
  serviceSchema,
  updateIndustrySchema,
  updateServiceSchema,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { PublishableCrudService } from '../../common/services/publishable-crud.service';
import { AbstractAdminCrudController } from '../../common/controllers/abstract-admin-crud.controller';
import { AbstractPublicCrudController } from '../../common/controllers/abstract-public-crud.controller';
import { Roles } from '../../common/decorators/roles.decorator';
import { imageOnlyInclude } from '../../common/prisma-includes';
import { mapRichText } from '../../common/utils/rich-text';

/** Domains We Work In. */
@Injectable()
export class IndustriesService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'industry',
      cacheTag: CACHE_TAGS.industries,
      slugSource: 'name',
      searchFields: ['name', 'description'],
      include: imageOnlyInclude,
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
}

/** What Our Teams Do. */
@Injectable()
export class ServicesService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'service',
      cacheTag: CACHE_TAGS.services,
      slugSource: 'title',
      searchFields: ['title', 'shortDescription'],
      include: imageOnlyInclude,
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
  protected override toCreateData(input: Record<string, unknown>) {
    return mapRichText(input, 'description');
  }
  protected override toUpdateData(input: Record<string, unknown>) {
    return mapRichText(input, 'description');
  }
}

@ApiTags('Public · Industries')
@Controller('industries')
export class PublicIndustriesController extends AbstractPublicCrudController {
  constructor(protected readonly service: IndustriesService) {
    super();
  }
}

@ApiTags('Admin · Industries')
@Controller('admin/industries')
@Roles(Role.EDITOR)
export class AdminIndustriesController extends AbstractAdminCrudController {
  protected readonly createSchema = industrySchema;
  protected readonly updateSchema = updateIndustrySchema;
  constructor(protected readonly service: IndustriesService) {
    super();
  }
}

@ApiTags('Public · Services')
@Controller('services')
export class PublicServicesController extends AbstractPublicCrudController {
  constructor(protected readonly service: ServicesService) {
    super();
  }
}

@ApiTags('Admin · Services')
@Controller('admin/services')
@Roles(Role.EDITOR)
export class AdminServicesController extends AbstractAdminCrudController {
  protected readonly createSchema = serviceSchema;
  protected readonly updateSchema = updateServiceSchema;
  constructor(protected readonly service: ServicesService) {
    super();
  }
}

@Module({
  controllers: [
    PublicIndustriesController,
    AdminIndustriesController,
    PublicServicesController,
    AdminServicesController,
  ],
  providers: [IndustriesService, ServicesService],
  exports: [IndustriesService, ServicesService],
})
export class CapabilitiesModule {}
