import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  const configServiceMock: Pick<ConfigService, 'get' | 'getOrThrow'> = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/fynora',
        NODE_ENV: 'test',
      };
      return values[key];
    }),
    get: jest.fn(() => undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
