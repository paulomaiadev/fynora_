import { Injectable } from '@nestjs/common';
import type { TransactionSession } from '../common/persistence/transaction-session.type';
import type { PrismaTransactionClient } from '../prisma/prisma-transaction-client.type';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyEntity } from './entity/company.entity';

export type CreateCompanyData = {
  name: string;
  document: string;
};

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateCompanyData,
    session?: TransactionSession,
  ): Promise<CompanyEntity> {
    const client = this.resolveClient(session);
    const company = await client.company.create({
      data: {
        name: data.name,
        document: data.document,
      },
    });

    return CompanyEntity.fromPrisma(company);
  }

  async findByDocument(
    document: string,
    session?: TransactionSession,
  ): Promise<CompanyEntity | null> {
    const client = this.resolveClient(session);
    const company = await client.company.findUnique({
      where: { document },
    });

    return company ? CompanyEntity.fromPrisma(company) : null;
  }

  private resolveClient(
    session?: TransactionSession,
  ): PrismaTransactionClient | PrismaService {
    if (!session) {
      return this.prisma;
    }

    return session as unknown as PrismaTransactionClient;
  }
}
