import { Controller, Injectable, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CACHE_TAGS,
  cultureValueSchema,
  perkSchema,
  Role,
  teamMemberSchema,
  updateCultureValueSchema,
  updatePerkSchema,
  updateTeamMemberSchema,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { PublishableCrudService } from '../../common/services/publishable-crud.service';
import { AbstractAdminCrudController } from '../../common/controllers/abstract-admin-crud.controller';
import { AbstractPublicListController } from '../../common/controllers/abstract-public-list.controller';
import { Roles } from '../../common/decorators/roles.decorator';
import { photoOnlyInclude } from '../../common/prisma-includes';

@Injectable()
export class TeamService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'teamMember',
      cacheTag: CACHE_TAGS.team,
      searchFields: ['name', 'role', 'bio'],
      include: { ...photoOnlyInclude, department: { select: { id: true, name: true, slug: true } } },
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
}

@Injectable()
export class ValuesService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'cultureValue',
      cacheTag: CACHE_TAGS.values,
      searchFields: ['title', 'description'],
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
}

@Injectable()
export class PerksService extends PublishableCrudService {
  constructor(prisma: PrismaService, redis: RedisService, revalidation: RevalidationService) {
    super(prisma, redis, revalidation, {
      model: 'perk',
      cacheTag: CACHE_TAGS.perks,
      searchFields: ['title', 'description'],
      extraRevalidateTags: [CACHE_TAGS.homepage],
      defaultSort: { field: 'order', order: 'asc' },
    });
  }
}

@ApiTags('Public · Team')
@Controller('team')
export class PublicTeamController extends AbstractPublicListController {
  constructor(protected readonly service: TeamService) {
    super();
  }
}

@ApiTags('Admin · Team')
@Controller('admin/team')
@Roles(Role.EDITOR)
export class AdminTeamController extends AbstractAdminCrudController {
  protected readonly createSchema = teamMemberSchema;
  protected readonly updateSchema = updateTeamMemberSchema;
  constructor(protected readonly service: TeamService) {
    super();
  }
}

@ApiTags('Public · Values')
@Controller('culture-values')
export class PublicValuesController extends AbstractPublicListController {
  constructor(protected readonly service: ValuesService) {
    super();
  }
}

@ApiTags('Admin · Values')
@Controller('admin/culture-values')
@Roles(Role.EDITOR)
export class AdminValuesController extends AbstractAdminCrudController {
  protected readonly createSchema = cultureValueSchema;
  protected readonly updateSchema = updateCultureValueSchema;
  constructor(protected readonly service: ValuesService) {
    super();
  }
}

@ApiTags('Public · Perks')
@Controller('perks')
export class PublicPerksController extends AbstractPublicListController {
  constructor(protected readonly service: PerksService) {
    super();
  }
}

@ApiTags('Admin · Perks')
@Controller('admin/perks')
@Roles(Role.EDITOR)
export class AdminPerksController extends AbstractAdminCrudController {
  protected readonly createSchema = perkSchema;
  protected readonly updateSchema = updatePerkSchema;
  constructor(protected readonly service: PerksService) {
    super();
  }
}

@Module({
  controllers: [
    PublicTeamController,
    AdminTeamController,
    PublicValuesController,
    AdminValuesController,
    PublicPerksController,
    AdminPerksController,
  ],
  providers: [TeamService, ValuesService, PerksService],
  exports: [TeamService, ValuesService, PerksService],
})
export class PeopleModule {}
