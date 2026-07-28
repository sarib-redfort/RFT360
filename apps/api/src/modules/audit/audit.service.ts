import { Injectable, Logger } from '@nestjs/common';
import {
  buildPaginationMeta,
  type AuditAction,
  type ListQueryInput,
  type PaginatedResult,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditRecordInput {
  actorId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

/**
 * Writes the immutable audit trail for the CMS.
 *
 * `record` is fire-and-forget by convention: a logging failure must never break
 * the business operation that triggered it, so errors are swallowed and logged
 * rather than propagated.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditRecordInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: input.actorId,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          summary: input.summary,
          metadata: input.metadata as never,
          ip: input.ip,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to write audit log: ${(error as Error).message}`);
    }
  }

  async list(query: ListQueryInput): Promise<PaginatedResult<unknown>> {
    const where: Record<string, unknown> = {};
    if (query.search) {
      where.OR = [
        { entityType: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data, meta: buildPaginationMeta(total, query.page, query.limit) };
  }
}
