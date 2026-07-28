import { SetMetadata } from '@nestjs/common';
import type { Role } from '@rft360/shared';

/** Metadata key read by `RolesGuard`. */
export const ROLES_KEY = 'roles';

/**
 * Restricts a route to the listed roles (or better — see `ROLE_RANK`).
 * Requires `JwtAuthGuard` + `RolesGuard` to be active.
 *
 * @example
 *   @Roles('ADMIN') // ADMIN and SUPER_ADMIN may access
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
