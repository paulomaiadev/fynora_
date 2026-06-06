import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateCompanyDto } from './create-company.dto';
import { OnboardingUserDto } from './onboarding-user.dto';

export class CompanyOnboardingDto {
  @ApiProperty({ type: CreateCompanyDto })
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  company: CreateCompanyDto;

  @ApiProperty({ type: OnboardingUserDto })
  @ValidateNested()
  @Type(() => OnboardingUserDto)
  user: OnboardingUserDto;
}
