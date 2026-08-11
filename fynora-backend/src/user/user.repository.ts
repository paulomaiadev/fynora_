import { Injectable } from '@nestjs/common';
import type { TransactionSession } from '../common/persistence/transaction-session.type';
import type { PrismaTransactionClient } from '../prisma/prisma-transaction-client.type';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from './entity/user.entity';

export type CreateUserData = {
  companyId: string;
  email: string;
  password: string;
};

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateUserData,
    session?: TransactionSession,
  ): Promise<UserEntity> {
    const client = this.resolveClient(session);
    const user = await client.user.create({
      data: {
        companyId: data.companyId,
        email: data.email,
        password: data.password,
      },
    });

    return UserEntity.fromPrisma(user);
  }

  async findByEmail(
    email: string,
    session?: TransactionSession,
  ): Promise<UserEntity | null> {
    const client = this.resolveClient(session);
    const user = await client.user.findUnique({
      where: { email },
    });

    return user ? UserEntity.fromPrisma(user) : null;
  }

  async findByIdAndCompany(
    id: string,
    companyId: string,
    session?: TransactionSession,
  ): Promise<UserEntity | null> {
    const client = this.resolveClient(session);
    const user = await client.user.findFirst({
      where: {
        id,
        companyId,
      },
    });

    return user ? UserEntity.fromPrisma(user) : null;
  }

  async findAllByCompany(
    companyId: string,
    session?: TransactionSession,
  ): Promise<UserEntity[]> {
    const client = this.resolveClient(session);
    const users = await client.user.findMany({
      where: { companyId },
      orderBy: { email: 'asc' },
    });

    return users.map((user) => UserEntity.fromPrisma(user));
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
