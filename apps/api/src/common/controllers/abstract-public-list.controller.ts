import { Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { listQuerySchema } from '@rft360/shared';
import { Public } from '../decorators/public.decorator';
import type { PublishableCrudService } from '../services/publishable-crud.service';

/**
 * Public read surface for simple, slug-less content that renders as a full
 * ordered list (culture values, perks, statistics, logos, awards, team, …).
 * No detail route — these are always consumed as a set.
 */
export abstract class AbstractPublicListController {
  protected abstract readonly service: PublishableCrudService;
  /** Upper bound on how many items a single request returns. */
  protected readonly maxItems: number = 100;

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published items (ordered)' })
  list(@Query('limit') limit?: string) {
    const parsed = listQuerySchema.parse({
      limit: limit ? Number(limit) : this.maxItems,
      sortBy: 'order',
      sortOrder: 'asc',
    });
    return this.service.publicList(parsed);
  }
}
