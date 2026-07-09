/*
  Warnings:

  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Revenue` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CPF', 'CNPJ');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INFLOW', 'OUTFLOW');

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_company_id_fkey";

-- DropForeignKey
ALTER TABLE "Insight" DROP CONSTRAINT "Insight_company_id_fkey";

-- DropForeignKey
ALTER TABLE "Revenue" DROP CONSTRAINT "Revenue_company_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_company_id_fkey";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "documentType" "DocumentType";

-- DropTable
DROP TABLE "Expense";

-- DropTable
DROP TABLE "Revenue";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "isBusiness" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
