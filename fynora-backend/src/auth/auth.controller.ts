import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK) // <-- Adicionado para retornar 200 em vez de 201
  @ApiOperation({ summary: 'Autenticar usuário e obter JWT (público)' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}