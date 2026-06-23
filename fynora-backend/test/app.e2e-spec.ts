import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/bootstrap/configure-app';

describe('AppController (e2e)', () => {
  let app: INestApplication<App> | undefined;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  it('/api/v1 (GET) exige autenticação (Secure by Default)', () => {
    if (!app) {
      throw new Error('Aplicação E2E não inicializada.');
    }

    return request(app.getHttpServer()).get('/api/v1').expect(401);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
});
