import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';

// Re-export so existing importers of `REDIS_CLIENT` from this module keep working.
export { REDIS_CLIENT } from './redis.constants';

/**
 * Provides a single shared ioredis connection plus a {@link RedisService}
 * convenience wrapper. Global so caching and rate limiting can inject either
 * anywhere.
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('redis.url', 'redis://localhost:6379');
        const client = new Redis(url, {
          /*
           * The cache is an optimisation, never a dependency — Redis must fail
           * FAST when unavailable rather than holding requests open.
           *
           * `enableOfflineQueue: false` is the critical setting. With ioredis's
           * default (true), commands issued while disconnected are queued and
           * each one waits out the retry budget; with Redis down that turned
           * every API request into an 8–12 second stall. Disabled, commands
           * reject immediately and `RedisService` degrades to uncached reads.
           */
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          // Keep reconnecting in the background so an outage self-heals, but
          // cap the backoff so we don't hammer a dead host.
          retryStrategy: (times) => Math.min(times * 500, 10_000),
          lazyConnect: false,
        });

        // ioredis emits `error` on every reconnect attempt. Log once per
        // outage instead of flooding the log with identical lines.
        let outageLogged = false;
        client.on('error', (err) => {
          if (outageLogged) return;
          outageLogged = true;
          console.warn(
            `[redis] unavailable (${err.message}) — serving uncached; retrying in background`,
          );
        });
        client.on('ready', () => {
          outageLogged = false;
        });
        return client;
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
