# Fynora — AI Rules

## Objetivo

Garantir que a IA mantenha consistência no código.

---

## Regras

* seguir arquitetura definida
* usar TypeScript
* respeitar estrutura de pastas
* não criar padrões novos

---

## Backend

* NestJS obrigatório
* usar DTO
* separar camadas

---

## Banco

* usar Prisma ORM — nunca SQL puro
* respeitar schema — não modificar sem instrução explícita
* usar migrations para alterações de schema
* **NUNCA injetar `PrismaService` diretamente em Services ou Repositories**
* Todo acesso ao banco DEVE passar pelo `PrismaTransactionManager`
* Operações com múltiplas escritas DEVEM usar `TransactionSession` para garantir atomicidade
* Padrão de uso: `this.txManager.run(async (tx) => { ... })`

---

## Multi-tenant

* sempre usar company_id
* nunca acessar dados sem validação
