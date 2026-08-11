import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SanitizeText } from '../../common/decorators/sanitize-text.decorator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Minha Empresa MEI' })
  @SanitizeText()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
