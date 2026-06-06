import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaTransactionManager } from './prisma-transaction.manager';

@Global()
@Module({
  providers: [PrismaService, PrismaTransactionManager],
  exports: [PrismaService, PrismaTransactionManager],
})
export class PrismaModule {}
