import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Module,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import {
  contactFormSchema,
  listQuerySchema,
  Role,
  SubmissionStatus,
  type ListQueryInput,
} from '@rft360/shared';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SubmissionsService } from './submissions.service';

@ApiTags('Public · Contact')
@Controller('contact')
export class PublicContactController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  @Post()
  @ApiOperation({ summary: 'Submit the contact form' })
  submit(@Body() body: unknown, @Req() req: Request) {
    const dto = contactFormSchema.parse(body);
    return this.submissions.submit(dto, { ip: req.ip, userAgent: req.headers['user-agent'] });
  }
}

@ApiTags('Admin · Submissions')
@Controller('admin/submissions')
@Roles(Role.EDITOR)
export class AdminSubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List contact submissions (inbox)' })
  list(@Query() query: unknown, @Query('status') status?: SubmissionStatus) {
    // Drop the content-status field from the base query; submissions have their
    // own SubmissionStatus lifecycle.
    const { status: _ignored, ...parsed } = listQuerySchema.parse(query) as ListQueryInput;
    return this.submissions.list({ ...parsed, status });
  }

  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="submissions.csv"')
  @ApiOperation({ summary: 'Export all submissions as CSV' })
  export() {
    return this.submissions.exportCsv();
  }

  @Get(':id')
  @ApiOperation({ summary: 'View a submission (marks it read)' })
  findOne(@Param('id') id: string) {
    return this.submissions.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update submission status / notes' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: SubmissionStatus,
    @Body('notes') notes?: string,
  ) {
    return this.submissions.updateStatus(id, status, notes);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a submission' })
  remove(@Param('id') id: string) {
    return this.submissions.remove(id);
  }
}

@Module({
  controllers: [PublicContactController, AdminSubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
