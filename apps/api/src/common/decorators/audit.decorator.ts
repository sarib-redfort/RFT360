import { SetMetadata } from '@nestjs/common';
import type { AuditAction } from '@rft360/shared';
import { AUDIT_KEY, type AuditMeta } from '../interceptors/audit.interceptor';

/**
 * Tags a mutating handler so `AuditInterceptor` records who did what.
 *
 * @example
 *   @Audit('UPDATE', 'Post')
 */
export const Audit = (action: AuditAction, entityType: string) =>
  SetMetadata(AUDIT_KEY, { action, entityType } satisfies AuditMeta);
