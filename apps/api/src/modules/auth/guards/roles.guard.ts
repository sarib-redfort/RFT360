import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_RANK, type Role } from '@rft360/shared';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import type { RequestUser } from '../../../common/decorators/current-user.decorator';

/**
 * Enforces `@Roles(...)`. A user passes if their role's rank meets or exceeds
 * the lowest-ranked required role, so `@Roles('ADMIN')` also admits SUPER_ADMIN.
 * Runs after `JwtAuthGuard`, so `request.user` is always present here.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as RequestUser | undefined;
    if (!user) throw new ForbiddenException('Authentication required');

    const userRank = ROLE_RANK[user.role as Role] ?? 0;
    const minRequiredRank = Math.min(...required.map((role) => ROLE_RANK[role]));

    if (userRank < minRequiredRank) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }
    return true;
  }
}
