import type { Company as PrismaCompany } from '@prisma/client';

export class CompanyEntity {
  readonly id: string;
  readonly name: string;
  readonly document: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(data: PrismaCompany) {
    this.id = data.id;
    this.name = data.name;
    this.document = data.document;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static fromPrisma(data: PrismaCompany): CompanyEntity {
    return new CompanyEntity(data);
  }
}
