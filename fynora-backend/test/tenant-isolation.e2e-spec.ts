import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

const TEST_PASSWORD = 'SenhaForte@2026';

const TENANT_A = {
  company: {
    name: 'Empresa A E2E',
    document: '52998224725',
  },
  user: {
    name: 'Usuario A',
    email: 'tenant-a-e2e@test.com',
    password: TEST_PASSWORD,
  },
};

const TENANT_B = {
  company: {
    name: 'Empresa B E2E',
    document: '11222333000181',
  },
  user: {
    name: 'Usuario B',
    email: 'tenant-b-e2e@test.com',
    password: TEST_PASSWORD,
  },
};

async function cleanUserAndCompanyTables(
  prisma: PrismaService,
): Promise<void> {
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
}

describe('Tenant isolation (e2e)', () => {
  let app: INestApplication<App> | undefined;
  let prisma: PrismaService | undefined;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    await cleanUserAndCompanyTables(prisma);
  });

  afterAll(async () => {
    if (prisma) {
      await cleanUserAndCompanyTables(prisma);
    }

    if (app) {
      await app.close();
    }
  });

  describe('Anti-IDOR cross-tenant access', () => {
    let userAId: string;
    let userBId: string;
    let tokenA: string;

    beforeAll(async () => {
      if (!app) {
        throw new Error('Aplicação E2E não inicializada.');
      }

      const onboardingA = await request(app.getHttpServer())
        .post('/api/v1/companies/onboarding')
        .send(TENANT_A)
        .expect(201);

      userAId = onboardingA.body.user.id as string;

      const loginA = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: TENANT_A.user.email,
          password: TEST_PASSWORD,
        })
        .expect(200);

      tokenA = loginA.body.access_token as string;

      const onboardingB = await request(app.getHttpServer())
        .post('/api/v1/companies/onboarding')
        .send(TENANT_B)
        .expect(201);

      userBId = onboardingB.body.user.id as string;
    });

    it('deve retornar 404 quando tenant A tenta acessar usuário do tenant B', async () => {
      if (!app) {
        throw new Error('Aplicação E2E não inicializada.');
      }

      await request(app.getHttpServer())
        .get(`/api/v1/users/${userBId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);
    });

    it('deve retornar 200 com dados do próprio usuário quando tenant A acessa seu perfil', async () => {
      if (!app) {
        throw new Error('Aplicação E2E não inicializada.');
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${userAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: userAId,
        email: TENANT_A.user.email,
        name: TENANT_A.user.name,
      });
      expect(response.body).not.toHaveProperty('password');
    });
  });
});
