import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentCompanyId } from '../auth/decorators/current-company-id.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Listar usuários do tenant autenticado',
    description:
      'Retorna todos os usuários vinculados ao companyId do JWT. Isolamento multi-tenant obrigatório.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de usuários do time retornada com sucesso.',
    type: [UserResponseDto],
  })
  async listTeam(
    @CurrentCompanyId() companyId: string,
  ): Promise<UserResponseDto[]> {
    return this.userService.listTeam(companyId);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obter perfil de usuário do tenant',
    description:
      'Busca usuário por id cruzado com companyId do JWT. Retorna 404 se o usuário não pertencer ao tenant.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil do usuário retornado com sucesso.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado.',
  })
  async getProfile(
    @Param('id') id: string,
    @CurrentCompanyId() companyId: string,
  ): Promise<UserResponseDto> {
    return this.userService.getProfile(id, companyId);
  }
}
