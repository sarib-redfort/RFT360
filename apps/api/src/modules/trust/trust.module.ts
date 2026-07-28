import { Controller, Injectable, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  awardSchema,
  CACHE_TAGS,
  certificationSchema,
  clientLogoSchema,
  Role,
  statisticSchema,
  updateAwardSchema,
  updateCertificationSchema,
  updateClientLogoSchema,
  updateStatisticSchema,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { PublishableCrudService } from '../../common/services/publishable-crud.service';
import { AbstractAdminCrudController } from '../../common/controllers/abstract-admin-crud.controller';
import { AbstractPublicListController } from '../../common/controllers/abstract-public-list.controller';
import { Roles } from '../../common/decorators/roles.decorator';
import { imageOnlyInclude, logoOnlyInclude } from '../../common/prisma-includes';

/** Client + partner logos (the `isClient` flag distinguishes them). */
@Injectable()
export class ClientLogosService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'clientLogo',
      cacheTag: CACHE_TAGS.trust,
      searchFields: ['name'],
      include: logoOnlyInclude,
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
}

@Injectable()
export class CertificationsService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'certification',
      cacheTag: CACHE_TAGS.trust,
      searchFields: ['name', 'issuer'],
      include: logoOnlyInclude,
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
}

@Injectable()
export class AwardsService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'award',
      cacheTag: CACHE_TAGS.trust,
      searchFields: ['title', 'issuer'],
      include: imageOnlyInclude,
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
}

@Injectable()
export class StatisticsService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'statistic',
      cacheTag: CACHE_TAGS.trust,
      searchFields: ['label', 'value'],
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
}

@ApiTags('Public · Trust')
@Controller('client-logos')
export class PublicClientLogosController extends AbstractPublicListController {
  constructor(protected readonly service: ClientLogosService) {
    super();
  }
}

@ApiTags('Admin · Trust')
@Controller('admin/client-logos')
@Roles(Role.EDITOR)
export class AdminClientLogosController extends AbstractAdminCrudController {
  protected readonly createSchema = clientLogoSchema;
  protected readonly updateSchema = updateClientLogoSchema;
  constructor(protected readonly service: ClientLogosService) {
    super();
  }
}

@ApiTags('Public · Trust')
@Controller('certifications')
export class PublicCertificationsController extends AbstractPublicListController {
  constructor(protected readonly service: CertificationsService) {
    super();
  }
}

@ApiTags('Admin · Trust')
@Controller('admin/certifications')
@Roles(Role.EDITOR)
export class AdminCertificationsController extends AbstractAdminCrudController {
  protected readonly createSchema = certificationSchema;
  protected readonly updateSchema = updateCertificationSchema;
  constructor(protected readonly service: CertificationsService) {
    super();
  }
}

@ApiTags('Public · Trust')
@Controller('awards')
export class PublicAwardsController extends AbstractPublicListController {
  constructor(protected readonly service: AwardsService) {
    super();
  }
}

@ApiTags('Admin · Trust')
@Controller('admin/awards')
@Roles(Role.EDITOR)
export class AdminAwardsController extends AbstractAdminCrudController {
  protected readonly createSchema = awardSchema;
  protected readonly updateSchema = updateAwardSchema;
  constructor(protected readonly service: AwardsService) {
    super();
  }
}

@ApiTags('Public · Trust')
@Controller('statistics')
export class PublicStatisticsController extends AbstractPublicListController {
  constructor(protected readonly service: StatisticsService) {
    super();
  }
}

@ApiTags('Admin · Trust')
@Controller('admin/statistics')
@Roles(Role.EDITOR)
export class AdminStatisticsController extends AbstractAdminCrudController {
  protected readonly createSchema = statisticSchema;
  protected readonly updateSchema = updateStatisticSchema;
  constructor(protected readonly service: StatisticsService) {
    super();
  }
}

@Module({
  controllers: [
    PublicClientLogosController,
    AdminClientLogosController,
    PublicCertificationsController,
    AdminCertificationsController,
    PublicAwardsController,
    AdminAwardsController,
    PublicStatisticsController,
    AdminStatisticsController,
  ],
  providers: [ClientLogosService, CertificationsService, AwardsService, StatisticsService],
  exports: [ClientLogosService, CertificationsService, AwardsService, StatisticsService],
})
export class TrustModule {}
