import { ApiProperty } from '@nestjs/swagger';
import type { UserEntity } from '../../user/entity/user.entity';

export class OnboardingUserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  company_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: UserEntity): OnboardingUserResponseDto {
    return {
      id: entity.id,
      company_id: entity.company_id,
      name: entity.name,
      email: entity.email,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
