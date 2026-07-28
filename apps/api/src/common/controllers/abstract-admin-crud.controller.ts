import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ZodSchema } from 'zod';
import {
  ContentStatus,
  listQuerySchema,
  reorderSchema,
  type ListQueryInput,
} from '@rft360/shared';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { PublishableCrudService } from '../services/publishable-crud.service';

/**
 * Reusable admin CRUD surface for a publishable entity.
 *
 * Concrete controllers extend this and supply `service`, `createSchema` and
 * `updateSchema`; they add `@Controller('admin/…')`, `@ApiTags(…)` and
 * `@Roles(…)`. Nest inherits the decorated route methods below, so each entity
 * gets a consistent set of endpoints (list/read/create/update/status/reorder/
 * delete) without repeating the wiring.
 *
 * Payloads are validated in the method body (not via a param pipe) so the
 * per-entity Zod schema can be an instance property rather than a value fixed
 * at decoration time.
 */
export abstract class AbstractAdminCrudController {
  protected abstract readonly service: PublishableCrudService;
  protected abstract readonly createSchema: ZodSchema;
  protected abstract readonly updateSchema: ZodSchema;

  @Get()
  @ApiOperation({ summary: 'List all records (admin — includes drafts)' })
  list(@Query() query: unknown) {
    const parsed = listQuerySchema.parse(query) as ListQueryInput;
    return this.service.list(parsed, false);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a record by id' })
  findOne(@Param('id') id: string) {
    return this.service.findByIdOrThrow(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a record' })
  create(@Body() body: unknown, @CurrentUser('sub') userId: string) {
    return this.service.create(this.createSchema.parse(body) as Record<string, unknown>, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a record' })
  update(@Param('id') id: string, @Body() body: unknown, @CurrentUser('sub') userId: string) {
    return this.service.update(id, this.updateSchema.parse(body) as Record<string, unknown>, userId);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a record' })
  publish(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.setStatus(id, ContentStatus.PUBLISHED, userId);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Move a record back to draft' })
  unpublish(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.setStatus(id, ContentStatus.DRAFT, userId);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a record' })
  archive(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.setStatus(id, ContentStatus.ARCHIVED, userId);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Persist a new manual order for a set of records' })
  reorder(@Body() body: unknown) {
    return this.service.reorder(reorderSchema.parse(body));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a record' })
  remove(@Param('id') id: string) {
    return this.service.removeById(id);
  }
}
