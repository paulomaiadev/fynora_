import { ApiProperty } from '@nestjs/swagger';
import type { CompanyEntity } from '../entity/company.entity';

export class CompanyResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, description: 'CPF/CNPJ somente dígitos' })
  document: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: CompanyEntity): CompanyResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      document: entity.document,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
