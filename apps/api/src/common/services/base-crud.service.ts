import { NotFoundException } from '@nestjs/common';
import {
  buildPaginationMeta,
  ContentStatus,
  type ListQueryInput,
  type PaginatedResult,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * A Prisma model delegate exposes the standard CRUD methods. We only type the
 * handful this base class calls; concrete services keep full type-safety at the
 * call site by passing their model's own input types.
 */
export interface PrismaDelegate {
  findMany(args?: unknown): Promise<unknown[]>;
  findUnique(args: unknown): Promise<unknown>;
  findFirst(args: unknown): Promise<unknown>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
  count(args?: unknown): Promise<number>;
}

export interface BaseCrudOptions {
  /** Prisma model name as it appears on `PrismaService` (e.g. 'post'). */
  model: string;
  /** Fields matched by the `search` query, OR-combined, case-insensitive. */
  searchFields?: string[];
  /** Default `orderBy` when the caller doesn't specify one. */
  defaultSort?: { field: string; order: 'asc' | 'desc' };
  /** Relations to include on every read. */
  include?: Record<string, unknown>;
  /** Whether this model carries a `status` column (most content does). */
  hasStatus?: boolean;
}

/**
 * Shared list/read logic for content modules.
 *
 * The heavy lifting — building the `where`/`orderBy`/pagination and splitting
 * public (published-only) from admin (all statuses) reads — lives here so the
 * ~28 content services don't each reimplement it. Concrete services extend this
 * and add their create/update payload mapping.
 */
export abstract class BaseCrudService {
  protected constructor(
    protected readonly prisma: PrismaService,
    protected readonly options: BaseCrudOptions,
  ) {}

  /** The Prisma delegate for this service's model. */
  protected get delegate(): PrismaDelegate {
    return (this.prisma as unknown as Record<string, PrismaDelegate>)[this.options.model];
  }

  /** Builds a case-insensitive OR search clause across the configured fields. */
  protected buildSearchWhere(search?: string): Record<string, unknown> | undefined {
    if (!search || !this.options.searchFields?.length) return undefined;
    return {
      OR: this.options.searchFields.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })),
    };
  }

  protected buildOrderBy(query: ListQueryInput): Record<string, string> {
    if (query.sortBy) return { [query.sortBy]: query.sortOrder };
    const fallback = this.options.defaultSort ?? { field: 'createdAt', order: 'desc' as const };
    return { [fallback.field]: fallback.order };
  }

  /**
   * Paginated list.
   * @param query    parsed list query
   * @param publicOnly when true, forces `status = PUBLISHED` (public endpoints)
   * @param extraWhere additional filter merged into the where clause
   */
  async list<T>(
    query: ListQueryInput,
    publicOnly: boolean,
    extraWhere: Record<string, unknown> = {},
  ): Promise<PaginatedResult<T>> {
    const where: Record<string, unknown> = { ...extraWhere };

    const searchWhere = this.buildSearchWhere(query.search);
    if (searchWhere) Object.assign(where, searchWhere);

    if (this.options.hasStatus !== false) {
      if (publicOnly) {
        where.status = ContentStatus.PUBLISHED;
      } else if (query.status) {
        where.status = query.status;
      }
    }

    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.delegate.findMany({
        where,
        include: this.options.include,
        orderBy: this.buildOrderBy(query),
        skip,
        take: query.limit,
      }),
      this.delegate.count({ where }),
    ]);

    return {
      data: data as T[],
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  async findByIdOrThrow<T>(id: string, publicOnly = false): Promise<T> {
    const where: Record<string, unknown> = { id };
    if (publicOnly && this.options.hasStatus !== false) {
      where.status = ContentStatus.PUBLISHED;
    }
    const record = await this.delegate.findFirst({ where, include: this.options.include });
    if (!record) throw new NotFoundException(`${this.options.model} not found`);
    return record as T;
  }

  async findBySlugOrThrow<T>(slug: string, publicOnly = false): Promise<T> {
    const where: Record<string, unknown> = { slug };
    if (publicOnly && this.options.hasStatus !== false) {
      where.status = ContentStatus.PUBLISHED;
    }
    const record = await this.delegate.findFirst({ where, include: this.options.include });
    if (!record) throw new NotFoundException(`${this.options.model} not found`);
    return record as T;
  }

  async removeById(id: string): Promise<{ id: string }> {
    await this.findByIdOrThrow(id);
    await this.delegate.delete({ where: { id } });
    return { id };
  }
}
