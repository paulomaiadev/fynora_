import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Certifique-se de que o caminho para o seu PrismaService está correto
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Prisma } from '@prisma/client';

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
        isBusiness: createTransactionDto.isBusiness,
        category: createTransactionDto.category,
        company_id: companyId, // Isolamento de Tenant ativo
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.transaction.findMany({
      where: { company_id: companyId },
      orderBy: { date: 'desc' },
    });
  }

  async remove(id: string, companyId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, company_id: companyId },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada.');
    }

    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async getDashboardStats(companyId: string) {
    // Agregação performática nativa no PostgreSQL
    const aggregations = await this.prisma.transaction.groupBy({
      by: ['type', 'isBusiness'],
      where: { company_id: companyId },
      _sum: {
        amount: true,
      },
    });

    let totalInflow = new Prisma.Decimal(0);
    let totalOutflow = new Prisma.Decimal(0);
    let businessInflow = new Prisma.Decimal(0);
    let businessOutflow = new Prisma.Decimal(0);
    let personalOutflow = new Prisma.Decimal(0);

    for (const group of aggregations) {
      const sum = group._sum.amount || new Prisma.Decimal(0);

      if (group.type === 'INFLOW') {
        totalInflow = totalInflow.add(sum);
        if (group.isBusiness) businessInflow = businessInflow.add(sum);
      } else if (group.type === 'OUTFLOW') {
        totalOutflow = totalOutflow.add(sum);
        if (group.isBusiness) {
          businessOutflow = businessOutflow.add(sum);
        } else {
          personalOutflow = personalOutflow.add(sum);
        }
      }
    }

    // Aplicação das fórmulas financeiras do plano
    const saldoTotal = totalInflow.minus(totalOutflow);
    const resultadoOperacional = businessInflow.minus(businessOutflow);

    let indiceConfusaoPatrimonial = 0;
    if (totalOutflow.greaterThan(0)) {
      indiceConfusaoPatrimonial = personalOutflow
        .dividedBy(totalOutflow)
        .mul(100)
        .toNumber();
    }

    return {
      saldoTotal: saldoTotal.toNumber(),
      resultadoOperacional: resultadoOperacional.toNumber(),
      indiceConfusaoPatrimonial: Number(indiceConfusaoPatrimonial.toFixed(2)),
      detalhes: {
        totalInflow: totalInflow.toNumber(),
        totalOutflow: totalOutflow.toNumber(),
        businessOutflow: businessOutflow.toNumber(),
        personalOutflow: personalOutflow.toNumber(),
      },
    };
  }
}
