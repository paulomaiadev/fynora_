import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  amount: number;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsBoolean()
  @IsOptional()
  isBusiness?: boolean = true;

  @IsString()
  @IsOptional()
  category?: string;
}
