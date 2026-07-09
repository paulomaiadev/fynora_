import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Ajuste o caminho se necessário
import { CurrentCompanyId } from '../auth/decorators/current-company-id.decorator';

@Controller('transaction')
@UseGuards(JwtAuthGuard) // Blinda TODAS as rotas deste módulo com JWT por padrão
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentCompanyId() companyId: string, // Injeção anti-IDOR da Fase 1
  ) {
    return this.transactionService.create(createTransactionDto, companyId);
  }

  @Get()
  findAll(@CurrentCompanyId() companyId: string) {
    return this.transactionService.findAll(companyId);
  }

  @Get('dashboard')
  getDashboardStats(@CurrentCompanyId() companyId: string) {
    return this.transactionService.getDashboardStats(companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentCompanyId() companyId: string) {
    return this.transactionService.remove(id, companyId);
  }
}
