import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp, resolveListenPort } from './bootstrap/configure-app';
import { resolveApplicationLogger } from './common/logger/resolve-application-logger';
import type { Env } from './config/env.schema';

async function bootstrap(): Promise<void> {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as Env['NODE_ENV'];
  const logger = resolveApplicationLogger(nodeEnv);

  const app = await NestFactory.create(AppModule, { logger });
  const configService = app.get(ConfigService);

  configureApp(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fynora API')
    .setDescription('API corporativa do sistema Fynora.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido em POST /api/v1/auth/login',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = resolveListenPort(configService);
  await app.listen(port);
}

bootstrap();
