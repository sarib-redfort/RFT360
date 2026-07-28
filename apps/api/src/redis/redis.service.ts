import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

/**
 * Typed convenience layer over ioredis for JSON caching and tag-based
 * invalidation.
 *
 * Cache reads/writes are best-effort: if Redis is unreachable the methods log
 * and fall through rather than throwing, so a cache outage degrades to
 * uncached responses instead of a site outage.
 */
@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  get raw(): Redis {
    return this.client;
  }

  /**
   * True only when the connection is actually usable.
   *
   * Every cache method short-circuits on this so that, during an outage, we
   * don't even attempt a command — no wasted round-trip, no error to catch,
   * and no log line per request. The client reconnects in the background, so
   * this flips back to true on its own once Redis returns.
   */
  private get isReady(): boolean {
    return this.client.status === 'ready';
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isReady) return null;
    try {
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      this.logger.warn(`cache get failed for ${key}: ${(error as Error).message}`);
      return null;
    }
  }

  /** Stores JSON with a TTL in seconds. Also indexes the key under any tags. */
  async set<T>(key: string, value: T, ttlSeconds = 300, tags: string[] = []): Promise<void> {
    if (!this.isReady) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      if (tags.length > 0) {
        const pipeline = this.client.pipeline();
        for (const tag of tags) {
          pipeline.sadd(this.tagKey(tag), key);
          // Tag sets outlive their entries slightly; they self-heal on invalidation.
          pipeline.expire(this.tagKey(tag), ttlSeconds + 60);
        }
        await pipeline.exec();
      }
    } catch (error) {
      this.logger.warn(`cache set failed for ${key}: ${(error as Error).message}`);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0 || !this.isReady) return;
    try {
      await this.client.del(...keys);
    } catch (error) {
      this.logger.warn(`cache del failed: ${(error as Error).message}`);
    }
  }

  /** Drops every cache entry indexed under the given tags. */
  async invalidateTags(tags: string[]): Promise<void> {
    if (tags.length === 0 || !this.isReady) return;
    try {
      const pipeline = this.client.pipeline();
      const tagKeys = tags.map((tag) => this.tagKey(tag));
      const keySets = await Promise.all(tagKeys.map((tagKey) => this.client.smembers(tagKey)));
      const keysToDelete = new Set<string>();
      for (const keys of keySets) keys.forEach((key) => keysToDelete.add(key));
      for (const key of keysToDelete) pipeline.del(key);
      for (const tagKey of tagKeys) pipeline.del(tagKey);
      await pipeline.exec();
    } catch (error) {
      this.logger.warn(`cache invalidateTags failed: ${(error as Error).message}`);
    }
  }

  /**
   * Read-through helper: return the cached value or compute, cache and return
   * it. Any cache error falls back to a direct compute.
   */
  async remember<T>(
    key: string,
    ttlSeconds: number,
    tags: string[],
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await factory();
    await this.set(key, value, ttlSeconds, tags);
    return value;
  }

  private tagKey(tag: string): string {
    return `tag:${tag}`;
  }
}
