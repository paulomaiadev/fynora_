import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentCompanyId } from '../auth/decorators/current-company-id.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CompanyService } from './company.service';
import { CompanyOnboardingDto } from './dto/company-onboarding.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
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

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Perfil da empresa autenticada',
    description:
      'Retorna os dados do tenant vinculado ao companyId do JWT. Sem parâmetro :id na URL — proteção anti-IDOR.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil da empresa retornado com sucesso.',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Empresa não encontrada.',
  })
  async getProfile(
    @CurrentCompanyId() companyId: string,
  ): Promise<CompanyResponseDto> {
    return this.companyService.getProfile(companyId);
  }
}
