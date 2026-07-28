import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import {
  ApplicationStatus,
  departmentSchema,
  jobApplicationSchema,
  jobSchema,
  listQuerySchema,
  Role,
  updateDepartmentSchema,
  updateJobSchema,
  UPLOAD_LIMITS,
  type ListQueryInput,
} from '@rft360/shared';
import { AbstractAdminCrudController } from '../../common/controllers/abstract-admin-crud.controller';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JobsService, DepartmentsService } from './jobs.service';
import { ApplicationsService } from './applications.service';

const resumeMimeTypes = UPLOAD_LIMITS.allowedDocumentMimeTypes.join('|');

// ── Public ────────────────────────────────────────────────────────────────

@ApiTags('Public · Careers')
@Controller('jobs')
export class PublicJobsController {
  constructor(private readonly jobs: JobsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List open positions (filterable)' })
  list(
    @Query() query: unknown,
    @Query('department') department?: string,
    @Query('employmentType') employmentType?: string,
    @Query('workMode') workMode?: string,
  ) {
    const parsed = listQuerySchema.parse(query) as ListQueryInput;
    return this.jobs.listPublic({ ...parsed, department, employmentType, workMode });
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get an open position by slug' })
  bySlug(@Param('slug') slug: string) {
    return this.jobs.findBySlugOrThrow(slug, true);
  }
}

@ApiTags('Public · Careers')
@Controller('departments')
export class PublicDepartmentsController {
  constructor(private readonly departments: DepartmentsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List departments' })
  list(@Query() query: unknown) {
    return this.departments.publicList(listQuerySchema.parse(query) as ListQueryInput);
  }
}

@ApiTags('Public · Careers')
@Controller('applications')
export class PublicApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Public()
  // Applications are heavier and abused less benignly — cap them per IP.
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit a job application (optional CV upload)' })
  @UseInterceptors(FileInterceptor('resume'))
  apply(
    @Body() body: unknown,
    @Req() req: Request,
    @UploadedFile() resume?: Express.Multer.File,
  ) {
    if (resume) this.assertResume(resume);
    const dto = jobApplicationSchema.parse(body);
    return this.applications.apply(dto, resume, req.ip);
  }

  private assertResume(file: Express.Multer.File) {
    if (!new RegExp(resumeMimeTypes).test(file.mimetype)) {
      throw new Error('CV must be a PDF or Word document');
    }
  }
}

// ── Admin ─────────────────────────────────────────────────────────────────

@ApiTags('Admin · Careers')
@Controller('admin/jobs')
@Roles(Role.EDITOR)
export class AdminJobsController extends AbstractAdminCrudController {
  protected readonly createSchema = jobSchema;
  protected readonly updateSchema = updateJobSchema;
  constructor(protected readonly service: JobsService) {
    super();
  }
}

@ApiTags('Admin · Careers')
@Controller('admin/departments')
@Roles(Role.EDITOR)
export class AdminDepartmentsController extends AbstractAdminCrudController {
  protected readonly createSchema = departmentSchema;
  protected readonly updateSchema = updateDepartmentSchema;
  constructor(protected readonly service: DepartmentsService) {
    super();
  }
}

@ApiTags('Admin · Careers')
@Controller('admin/applications')
@Roles(Role.EDITOR)
export class AdminApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Get()
  @ApiOperation({ summary: 'List applications (recruiter inbox)' })
  list(
    @Query() query: unknown,
    @Query('jobId') jobId?: string,
    @Query('status') status?: ApplicationStatus,
  ) {
    const { status: _ignored, ...parsed } = listQuerySchema.parse(query) as ListQueryInput;
    return this.applications.list(jobId, { ...parsed, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'View an application' })
  findOne(@Param('id') id: string) {
    return this.applications.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update application status / recruiter notes' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ApplicationStatus,
    @Body('notes') notes?: string,
  ) {
    return this.applications.updateStatus(id, status, notes);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an application' })
  remove(@Param('id') id: string) {
    return this.applications.remove(id);
  }
}
