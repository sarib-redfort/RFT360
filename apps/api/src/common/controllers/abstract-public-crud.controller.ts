import { Get, Param, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { listQuerySchema, type ListQueryInput } from '@rft360/shared';
import { Public } from '../decorators/public.decorator';
import type { PublishableCrudService } from '../services/publishable-crud.service';

/**
 * Reusable public read surface for a publishable entity.
 *
 * Only ever returns PUBLISHED records (the service forces the status filter),
 * so drafts never leak. Concrete controllers extend this, add
 * `@Controller('…')` + `@ApiTags(…)`, and set `service`. Every method is
 * `@Public()`, bypassing the global auth guard.
 */
export abstract class AbstractPublicCrudController {
  protected abstract readonly service: PublishableCrudService;

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published records' })
  list(@Query() query: unknown) {
    const parsed = listQuerySchema.parse(query) as ListQueryInput;
    return this.service.publicList(parsed);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a single published record by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlugOrThrow(slug, true);
  }
}
