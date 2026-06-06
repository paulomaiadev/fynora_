import type { ConfigService } from '@nestjs/config';
import type { Env } from './env.schema';

const LOCAL_DEV_ORIGINS: readonly string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

export function resolveCorsOrigins(configService: ConfigService): string[] {
  const nodeEnv = configService.getOrThrow<Env['NODE_ENV']>('NODE_ENV');
  const allowedOrigins = configService
    .getOrThrow<string>('ALLOWED_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (nodeEnv === 'development') {
    return [...new Set([...allowedOrigins, ...LOCAL_DEV_ORIGINS])];
  }

  return allowedOrigins;
}
