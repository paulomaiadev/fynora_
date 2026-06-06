import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsCpfOrCnpj } from '../../common/decorators/is-cpf-or-cnpj.decorator';
import { SanitizeText } from '../../common/decorators/sanitize-text.decorator';
import { StripDocument } from '../../common/decorators/strip-document.decorator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Minha Empresa MEI' })
  @SanitizeText()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: '12345678000199',
    description: 'CPF (11 dígitos) ou CNPJ (14 dígitos), apenas números após normalização',
  })
  @StripDocument()
  @IsCpfOrCnpj()
  @IsString()
  @IsNotEmpty()
  document: string;
}
