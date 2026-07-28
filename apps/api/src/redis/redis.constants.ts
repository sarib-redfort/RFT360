/**
 * Injection token for the shared ioredis connection.
 *
 * Kept in its own module (imported by neither the service nor the module) so
 * `redis.service.ts` and `redis.module.ts` don't form an import cycle — a cycle
 * can leave `@Inject(REDIS_CLIENT)` seeing `undefined` at decoration time
 * depending on evaluation order.
 */
export const REDIS_CLIENT = 'REDIS_CLIENT';
