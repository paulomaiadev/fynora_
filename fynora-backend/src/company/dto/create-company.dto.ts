import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Minha Empresa MEI' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '12345678000199', description: 'CPF ou CNPJ' })
  @IsString()
  @IsNotEmpty()
  document: string;
}
