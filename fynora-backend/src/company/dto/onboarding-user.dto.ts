import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SanitizeText } from '../../common/decorators/sanitize-text.decorator';

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,72}$/;

const PASSWORD_VALIDATION_MESSAGE =
  'A senha deve conter no mínimo uma letra maiúscula, uma minúscula, um número e um caractere especial';

export class OnboardingUserDto {
  @ApiProperty({ example: 'João Silva' })
  @SanitizeText()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'joao@empresa.com' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(320)
  email: string;

  @ApiProperty({
    example: 'SenhaForte@2026',
    minLength: 8,
    maxLength: 72,
    description:
      '8–72 caracteres, com maiúscula, minúscula, número e caractere especial',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_VALIDATION_MESSAGE })
  password: string;
}
