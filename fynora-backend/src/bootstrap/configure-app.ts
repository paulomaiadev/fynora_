import { RequestMethod, ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import helmet from 'helmet';
import { PrismaClientExceptionFilter } from '../common/filters/prisma-client-exception.filter';
import { resolveCorsOrigins } from '../config/cors.config';
import type { Env } from '../config/env.schema';

export function configureApp(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.use(helmet());

  app.enableCors({
    origin: resolveCorsOrigins(configService),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new PrismaClientExceptionFilter(httpAdapterHost),
  );

  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: 'api/docs', method: RequestMethod.ALL },
      { path: 'api/docs-json', method: RequestMethod.GET },
    ],
  });

  app.enableShutdownHooks();
}

export function resolveListenPort(configService: ConfigService): Env['PORT'] {
  return configService.getOrThrow<Env['PORT']>('PORT');
}
