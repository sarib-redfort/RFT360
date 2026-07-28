import { SetMetadata } from '@nestjs/common';

/** Metadata key checked by `JwtAuthGuard` to bypass authentication. */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as publicly accessible, skipping the global `JwtAuthGuard`.
 * Applied to every public-site read endpoint.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
