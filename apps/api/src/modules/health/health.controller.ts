import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

/**
 * Liveness/readiness probes for load balancers and uptime monitors.
 * Version-neutral + excluded from the global prefix, so they live at the
 * stable, unversioned paths `/health` and `/health/ready`.
 */
@ApiTags('Health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness check' })
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check — verifies database and Redis' })
  async readiness() {
    const [database, cache] = await Promise.all([this.checkDatabase(), this.checkRedis()]);
    const healthy = database && cache;
    return {
      status: healthy ? 'ok' : 'degraded',
      checks: { database, cache },
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    // Don't ping a disconnected client — with the offline queue disabled it
    // rejects anyway, and this keeps the probe instant during an outage.
    if (this.redis.raw.status !== 'ready') return false;
    try {
      return (await this.redis.raw.ping()) === 'PONG';
    } catch {
      return false;
    }
  }
}
