import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CompanyService } from './company.service';
import { CompanyOnboardingDto } from './dto/company-onboarding.dto';
import { OnboardingResponseDto } from './dto/onboarding-response.dto';

@ApiTags('company')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Public()
  @Post('onboarding')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Onboarding atômico (empresa + usuário admin)',
    description:
      'Cria tenant e usuário administrador em uma única transação. Rota pública de cadastro inicial.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tenant e usuário admin criados com sucesso.',
    type: OnboardingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Documento ou e-mail já cadastrado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos.',
  })
  async onboarding(
    @Body() dto: CompanyOnboardingDto,
  ): Promise<OnboardingResponseDto> {
    return this.companyService.onboarding(dto);
  }

  // Fase 2.1 — rotas autenticadas (JWT + isolamento por company_id)
  // @Get(':id')
  // @ApiBearerAuth('access-token')
  // async findById(@Param('id') id: string): Promise<CompanyResponseDto> { ... }
  //
  // @Get('me')
  // @ApiBearerAuth('access-token')
  // async findMe(): Promise<CompanyResponseDto> { ... }
  //
  // @Patch(':id')
  // @ApiBearerAuth('access-token')
  // async update(
  //   @Param('id') id: string,
  //   @Body() dto: UpdateCompanyDto,
  // ): Promise<CompanyResponseDto> { ... }
}
