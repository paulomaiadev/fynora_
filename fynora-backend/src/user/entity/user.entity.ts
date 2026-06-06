import type { User as PrismaUser } from '@prisma/client';

export class UserEntity {
  readonly id: string;
  readonly company_id: string;
  readonly email: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(data: PrismaUser) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.email = data.email;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static fromPrisma(data: PrismaUser): UserEntity {
    return new UserEntity(data);
  }
}
