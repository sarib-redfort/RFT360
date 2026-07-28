import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import type { AuditAction } from '@rft360/shared';
import { AuditService } from '../../modules/audit/audit.service';
import type { RequestUser } from '../decorators/current-user.decorator';

export const AUDIT_KEY = 'audit';
export interface AuditMeta {
  action: AuditAction;
  entityType: string;
}

/**
 * Records an audit-log entry after a successful mutation on any handler
 * decorated with `@Audit(...)`. Runs after the handler so it only logs when the
 * operation actually succeeded; failures are captured by the exception filter.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<AuditMeta | undefined>(AUDIT_KEY, context.getHandler());
    if (!meta) return next.handle();

    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;
    const ip = request.ip as string | undefined;

    return next.handle().pipe(
      tap((result) => {
        const entityId =
          result && typeof result === 'object' && 'id' in result
            ? (result as { id: string }).id
            : (request.params?.id as string | undefined);
        void this.audit.record({
          actorId: user?.sub,
          action: meta.action,
          entityType: meta.entityType,
          entityId,
          ip,
        });
      }),
    );
  }
}
