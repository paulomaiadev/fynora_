import { ApiProperty } from '@nestjs/swagger';
import type { UserEntity } from '../../user/entity/user.entity';

export class OnboardingUserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  company_id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: UserEntity): OnboardingUserResponseDto {
    return {
      id: entity.id,
      company_id: entity.companyId,
      email: entity.email,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
