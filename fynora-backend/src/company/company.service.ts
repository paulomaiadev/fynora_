import {
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { isPrismaUniqueConstraintOnFields } from '../common/utils/prisma-error.util';
import { stripDocument } from '../common/utils/document.util';
import { sanitizeText } from '../common/utils/sanitize-text.util';
import { PrismaTransactionManager } from '../prisma/prisma-transaction.manager';
import { UserRepository } from '../user/user.repository';
import { ONBOARDING_CONFLICT_MESSAGE } from './constants/onboarding.constants';
import { CompanyRepository } from './company.repository';
import type { CompanyOnboardingDto } from './dto/company-onboarding.dto';
import { OnboardingResponseDto } from './dto/onboarding-response.dto';
import { OnboardingResultEntity } from './entity/onboarding-result.entity';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    private readonly transactionManager: PrismaTransactionManager,
    private readonly companyRepository: CompanyRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async onboarding(dto: CompanyOnboardingDto): Promise<OnboardingResponseDto> {
    const companyName = sanitizeText(dto.company.name);
    const document = stripDocument(dto.company.document);
    const userName = sanitizeText(dto.user.name);
    const email = dto.user.email.trim().toLowerCase();

    try {
      const result = await this.transactionManager.runInTransaction(
        async (session) => {
          const existingCompany = await this.companyRepository.findByDocument(
            document,
            session,
          );

          if (existingCompany) {
            throw new ConflictException(ONBOARDING_CONFLICT_MESSAGE);
          }

          const existingUser = await this.userRepository.findByEmail(
            email,
            session,
          );

          if (existingUser) {
            throw new ConflictException(ONBOARDING_CONFLICT_MESSAGE);
          }

          const passwordHash = await bcrypt.hash(
            dto.user.password,
            BCRYPT_ROUNDS,
          );

          const company = await this.companyRepository.create(
            { name: companyName, document },
            session,
          );

          const user = await this.userRepository.create(
            {
              company_id: company.id,
              name: userName,
              email,
              password: passwordHash,
            },
            session,
          );

          return new OnboardingResultEntity(company, user);
        },
      );

      this.logger.log(
        `Onboarding concluído: companyId=${result.company.id} userId=${result.user.id}`,
      );

      return OnboardingResponseDto.fromEntity(result);
    } catch (error: unknown) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (
        isPrismaUniqueConstraintOnFields(error, ['document', 'email'])
      ) {
        throw new ConflictException(ONBOARDING_CONFLICT_MESSAGE);
      }

      throw error;
    }
  }

  // Fase 2.1 — endpoints protegidos por JWT com company_id
  // async findById(id: string, tenantCompanyId: string): Promise<CompanyResponseDto> { ... }
  // async update(id: string, tenantCompanyId: string, dto: UpdateCompanyDto): Promise<CompanyResponseDto> { ... }
}
