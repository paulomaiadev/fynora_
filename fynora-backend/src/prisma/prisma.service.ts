import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';
import { Pool, type PoolConfig } from 'pg';
import type { Env } from '../config/env.schema';

const DEFAULT_POOL_MAX = 20;
const DEFAULT_IDLE_TIMEOUT_MS = 30_000;
const DEFAULT_CONNECTION_TIMEOUT_MS = 5_000;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;
  private readonly nodeEnv: Env['NODE_ENV'];

  constructor(configService: ConfigService) {
    const connectionString = configService.getOrThrow<string>('DATABASE_URL');
    const nodeEnv = configService.getOrThrow<Env['NODE_ENV']>('NODE_ENV');

    const poolConfig: PoolConfig = {
      connectionString,
      max: configService.get<number>('DATABASE_POOL_MAX') ?? DEFAULT_POOL_MAX,
      idleTimeoutMillis:
        configService.get<number>('DATABASE_POOL_IDLE_TIMEOUT_MS') ??
        DEFAULT_IDLE_TIMEOUT_MS,
      connectionTimeoutMillis:
        configService.get<number>('DATABASE_POOL_CONNECTION_TIMEOUT_MS') ??
        DEFAULT_CONNECTION_TIMEOUT_MS,
    };

    const pool = new Pool(poolConfig);
    const log = resolvePrismaLogConfig(nodeEnv);

    super({ adapter: new PrismaPg(pool), log });
    this.pool = pool;
    this.nodeEnv = nodeEnv;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();

    if (this.nodeEnv === 'development') {
      // @ts-ignore — evento 'query' exige extensão de tipagem do PrismaClient
      this.$on('query', (e: Prisma.QueryEvent) => {
        this.logger.debug(
          `Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`,
        );
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end();
  }
}

function resolvePrismaLogConfig(
  nodeEnv: Env['NODE_ENV'],
): Prisma.LogDefinition[] {
  if (nodeEnv === 'development') {
    return [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'warn' },
    ];
  }

  return [
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ];
}
