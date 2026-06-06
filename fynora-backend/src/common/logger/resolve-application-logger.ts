import { ConsoleLogger, type LoggerService } from '@nestjs/common';
import type { Env } from '../../config/env.schema';

export function resolveApplicationLogger(
  nodeEnv: Env['NODE_ENV'],
): LoggerService | undefined {
  if (nodeEnv === 'production') {
    return new ConsoleLogger({
      json: true,
      colors: false,
      compact: true,
    });
  }

  return undefined;
}
