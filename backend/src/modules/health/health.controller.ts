import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../common/decorators';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Liveness/Readiness endpointlari — konteyner orkestratori (Docker/K8s/PaaS)
 * uchun. Hech qanday maxfiy ma'lumot chiqarmaydi.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startedAt = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Liveness — ilova ishlayaptimi' })
  liveness(): { status: string; uptime_seconds: number } {
    return {
      status: 'ok',
      uptime_seconds: Math.floor((Date.now() - this.startedAt) / 1000),
    };
  }

  @Public()
  @SkipThrottle()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness — DB ulanishi bilan' })
  async readiness(): Promise<{ status: string; database: string }> {
    try {
      // Yengil so'rov — DB ulanishini tekshiradi.
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      // 503 — orkestrator trafik yubormaydi.
      throw new ServiceUnavailableException({ status: 'unavailable', database: 'down' });
    }
    return { status: 'ok', database: 'up' };
  }
}
