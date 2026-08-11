import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto, companyId: string) {
    return this.prisma.transaction.create({
      data: {
        description: createTransactionDto.description,
        amount: new Prisma.Decimal(createTransactionDto.amount),
        type: createTransactionDto.type,
        date: new Date(createTransactionDto.date),
        category: createTransactionDto.category,
        companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.transaction.findMany({
      where: { companyId },
      orderBy: { date: 'desc' },
    });
  }

  async remove(id: string, companyId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, companyId },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada.');
    }

    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async getDashboardStats(companyId: string) {
    const aggregations = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { companyId },
      _sum: {
        amount: true,
      },
    });

    let totalInflow = new Prisma.Decimal(0);
    let totalOutflow = new Prisma.Decimal(0);

    for (const group of aggregations) {
      const sum = group._sum?.amount ?? new Prisma.Decimal(0);

      if (group.type === TransactionType.IN) {
        totalInflow = totalInflow.add(sum);
      } else if (group.type === TransactionType.OUT) {
        totalOutflow = totalOutflow.add(sum);
      }
    }

    const saldoTotal = totalInflow.minus(totalOutflow);
    const resultadoOperacional = saldoTotal;

    return {
      saldoTotal: saldoTotal.toNumber(),
      resultadoOperacional: resultadoOperacional.toNumber(),
      indiceConfusaoPatrimonial: 0,
      detalhes: {
        totalInflow: totalInflow.toNumber(),
        totalOutflow: totalOutflow.toNumber(),
        businessOutflow: 0,
        personalOutflow: 0,
      },
    };
  }
}
