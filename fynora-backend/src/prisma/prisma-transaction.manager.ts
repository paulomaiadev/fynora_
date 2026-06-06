import { Injectable } from '@nestjs/common';
import type { TransactionSession } from '../common/persistence/transaction-session.type';
import type { PrismaTransactionClient } from './prisma-transaction-client.type';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  async runInTransaction<T>(
    handler: (session: TransactionSession) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      const session = tx as unknown as TransactionSession;
      return handler(session);
    });
  }
}
