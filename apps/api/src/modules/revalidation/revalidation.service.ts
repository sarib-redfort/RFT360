import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RevalidatePayload } from '@rft360/shared';
import { RedisService } from '../../redis/redis.service';

/**
 * Keeps the statically-rendered Next.js site fresh after CMS edits.
 *
 * On publish/unpublish, content services call {@link revalidate} with the cache
 * tags they touched. This both drops the API's own Redis cache for those tags
 * and POSTs them to the web app's `/api/revalidate` route, which calls
 * `revalidateTag()` so affected pages regenerate on their next request.
 *
 * Fire-and-forget: a revalidation failure never blocks the edit that triggered
 * it — the page will simply refresh on its normal ISR interval instead.
 */
@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async revalidate(tags: string[], paths: string[] = []): Promise<void> {
    if (tags.length === 0 && paths.length === 0) return;

    // Always clear our own cache first, even if the web hook is unreachable.
    await this.redis.invalidateTags(tags);

    const webUrl = this.config.get<string>('revalidate.webUrl');
    const secret = this.config.get<string>('revalidate.secret');
    if (!webUrl || !secret) return;

    const payload: RevalidatePayload = { secret, tags, paths };
    try {
      const res = await fetch(`${webUrl.replace(/\/$/, '')}/api/revalidate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        this.logger.warn(`Revalidation returned ${res.status} for tags [${tags.join(', ')}]`);
      }
    } catch (error) {
      this.logger.warn(`Revalidation request failed: ${(error as Error).message}`);
    }
  }
}
