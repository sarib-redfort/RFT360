import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '@rft360/shared';

/**
 * The authenticated principal attached to the request by `JwtStrategy`.
 * `sub` is the user id.
 */
export type RequestUser = JwtPayload;

/**
 * Injects the authenticated user (or one of its properties) into a handler.
 *
 * @example
 *   me(@CurrentUser() user: RequestUser) { ... }
 *   me(@CurrentUser('sub') userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
