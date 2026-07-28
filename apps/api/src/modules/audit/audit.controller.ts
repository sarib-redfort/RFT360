import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { listQuerySchema, Role, type ListQueryInput } from '@rft360/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { AuditService } from './audit.service';

@ApiTags('Admin · Audit Log')
@Controller('admin/audit-logs')
@Roles(Role.ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit-log entries (admin)' })
  list(@Query(new ZodValidationPipe(listQuerySchema)) query: ListQueryInput & ListQueryDto) {
    return this.auditService.list(query);
  }
}
