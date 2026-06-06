/**
 * Sessão transacional opaca — sem expor tipos do Prisma na camada de domínio/aplicação.
 */
export interface TransactionSession {
  readonly __transactionSessionBrand: unique symbol;
}
