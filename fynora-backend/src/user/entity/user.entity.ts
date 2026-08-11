import type { User as PrismaUser } from '@prisma/client';

export class UserEntity {
  readonly id: string;
  readonly companyId: string;
  readonly email: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(data: PrismaUser) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.email = data.email;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static fromPrisma(data: PrismaUser): UserEntity {
    return new UserEntity(data);
  }
}
