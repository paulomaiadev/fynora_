import type { CompanyEntity } from './company.entity';
import type { UserEntity } from '../../user/entity/user.entity';

export class OnboardingResultEntity {
  constructor(
    readonly company: CompanyEntity,
    readonly user: UserEntity,
  ) {}
}
