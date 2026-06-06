import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaTransactionManager } from '../prisma/prisma-transaction.manager';
import { UserRepository } from '../user/user.repository';
import { ONBOARDING_CONFLICT_MESSAGE } from './constants/onboarding.constants';
import { CompanyRepository } from './company.repository';
import { CompanyService } from './company.service';
import type { CompanyOnboardingDto } from './dto/company-onboarding.dto';
import { CompanyEntity } from './entity/company.entity';
import { UserEntity } from '../user/entity/user.entity';

describe('CompanyService', () => {
  let service: CompanyService;

  const transactionManagerMock = {
    runInTransaction: jest.fn(),
  };

  const companyRepositoryMock = {
    create: jest.fn(),
    findByDocument: jest.fn(),
  };

  const userRepositoryMock = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const onboardingDto: CompanyOnboardingDto = {
    company: {
      name: 'Empresa Teste',
      document: '11222333000181',
    },
    user: {
      name: 'Admin Teste',
      email: 'admin@teste.com',
      password: 'SenhaForte@2026',
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: PrismaTransactionManager,
          useValue: transactionManagerMock,
        },
        { provide: CompanyRepository, useValue: companyRepositoryMock },
        { provide: UserRepository, useValue: userRepositoryMock },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should complete atomic onboarding', async () => {
    const company = new CompanyEntity({
      id: 'company-1',
      name: 'Empresa Teste',
      document: '11222333000181',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = new UserEntity({
      id: 'user-1',
      company_id: 'company-1',
      email: 'admin@teste.com',
      password: 'hashed',
      name: 'Admin Teste',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    transactionManagerMock.runInTransaction.mockImplementation(
      async (handler: (session: unknown) => Promise<unknown>) => handler({}),
    );
    companyRepositoryMock.findByDocument.mockResolvedValue(null);
    userRepositoryMock.findByEmail.mockResolvedValue(null);
    companyRepositoryMock.create.mockResolvedValue(company);
    userRepositoryMock.create.mockResolvedValue(user);

    const result = await service.onboarding(onboardingDto);

    expect(result.company.id).toBe('company-1');
    expect(result.user.email).toBe('admin@teste.com');
    expect(transactionManagerMock.runInTransaction).toHaveBeenCalledTimes(1);
    expect(companyRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ document: '11222333000181' }),
      expect.anything(),
    );
  });

  it('should reject duplicate document before transaction write', async () => {
    transactionManagerMock.runInTransaction.mockImplementation(
      async (handler: (session: unknown) => Promise<unknown>) => handler({}),
    );
    companyRepositoryMock.findByDocument.mockResolvedValue(
      new CompanyEntity({
        id: 'existing',
        name: 'Existente',
        document: '11222333000181',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await expect(service.onboarding(onboardingDto)).rejects.toMatchObject({
      response: { message: ONBOARDING_CONFLICT_MESSAGE },
    });
  });

  it('should map Prisma P2002 on document to business conflict', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '7.8.0',
        meta: { target: ['document'] },
      },
    );

    transactionManagerMock.runInTransaction.mockRejectedValue(prismaError);

    await expect(service.onboarding(onboardingDto)).rejects.toMatchObject({
      response: { message: ONBOARDING_CONFLICT_MESSAGE },
    });
  });
});
