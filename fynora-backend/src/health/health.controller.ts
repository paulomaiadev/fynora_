import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

const MEMORY_HEAP_THRESHOLD_BYTES = 300 * 1024 * 1024;

@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Health check público para load balancers',
    description:
      'Valida memória heap e conectividade com o banco via Prisma. Não requer autenticação.',
  })
  check() {
    return this.health.check([
      () =>
        this.memory.checkHeap('memory_heap', MEMORY_HEAP_THRESHOLD_BYTES),
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }
}
