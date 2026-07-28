import { Controller, Get, Module } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { homepageSectionSchema, Role, updateHomepageSectionSchema } from '@rft360/shared';
import { AbstractAdminCrudController } from '../../common/controllers/abstract-admin-crud.controller';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { HomepageService } from './homepage.service';

@ApiTags('Public · Homepage')
@Controller('homepage')
export class PublicHomepageController {
  constructor(private readonly homepage: HomepageService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'The full homepage: ordered sections with resolved content' })
  composite() {
    return this.homepage.getComposite();
  }
}

@ApiTags('Admin · Homepage')
@Controller('admin/homepage-sections')
@Roles(Role.EDITOR)
export class AdminHomepageController extends AbstractAdminCrudController {
  protected readonly createSchema = homepageSectionSchema;
  protected readonly updateSchema = updateHomepageSectionSchema;
  constructor(protected readonly service: HomepageService) {
    super();
  }
}

@Module({
  controllers: [PublicHomepageController, AdminHomepageController],
  providers: [HomepageService],
  exports: [HomepageService],
})
export class HomepageModule {}
