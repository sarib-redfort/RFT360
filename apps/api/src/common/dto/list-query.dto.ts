import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@rft360/shared';

/**
 * Documents the shared list query parameters for Swagger. The actual parsing
 * and validation is done by `listQuerySchema` (`@rft360/shared`) via a
 * `ZodValidationPipe` on the query, so this DTO is documentation only.
 */
export class ListQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: '1-based page number' })
  page?: number;

  @ApiPropertyOptional({ default: 12, minimum: 1, maximum: 100 })
  limit?: number;

  @ApiPropertyOptional({ description: 'Free-text search across the entity’s primary fields' })
  search?: string;

  @ApiPropertyOptional({ description: 'Field to sort by, e.g. createdAt' })
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    enum: ContentStatus,
    description: 'Admin only — filter by publication status',
  })
  status?: ContentStatus;
}
