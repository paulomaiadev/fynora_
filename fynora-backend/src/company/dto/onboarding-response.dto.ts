import { ApiProperty } from '@nestjs/swagger';
import type { OnboardingResultEntity } from '../entity/onboarding-result.entity';
import { CompanyResponseDto } from './company-response.dto';
import { OnboardingUserResponseDto } from './onboarding-user-response.dto';

export class OnboardingResponseDto {
  @ApiProperty({ type: CompanyResponseDto })
  company: CompanyResponseDto;

  @ApiProperty({ type: OnboardingUserResponseDto })
  user: OnboardingUserResponseDto;

  static fromEntity(entity: OnboardingResultEntity): OnboardingResponseDto {
    return {
      company: CompanyResponseDto.fromEntity(entity.company),
      user: OnboardingUserResponseDto.fromEntity(entity.user),
    };
  }
}
