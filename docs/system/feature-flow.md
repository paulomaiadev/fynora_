# 🔄 Feature Flow — Fynora

## Objetivo

Definir o fluxo padrão de execução de qualquer funcionalidade no sistema.

---

## 🧠 Arquitetura Base

Controller → Service → Repository → Database

---

## 📌 Responsabilidades

### Controller

* Recebe requisição
* Valida DTO
* NÃO contém regra de negócio

---

### Service

* Contém regras de negócio
* Orquestra o fluxo
* Valida dados

---

### Repository

* Acesso ao banco
* Usa Prisma
* NÃO contém regra de negócio

---

## 🔐 Multi-tenant

* companyId vem do JWT
* nunca do frontend
* sempre aplicado no repository

---

## 📌 Fluxo: Criar Receita

### 1. Request

POST /api/v1/revenues

{
"amount": 100,
"description": "Serviço",
"date": "2026-01-01"
}

---

### 2. Auth

* JwtAuthGuard valida token
* extrai companyId

---

### 3. Controller

create(dto, companyId)

---

### 4. Service

Valida:

* amount > 0
* date obrigatória

---

### 5. Repository

create({
...dto,
company_id: companyId
})

---

### 6. Database

* salva com company_id
* aplica constraints

---

### 7. Response

{
"success": true,
"data": { "id": "uuid" },
"error": null
}

---

## 🚫 Regras

❌ NÃO:

* acessar banco no controller
* pular service
* confiar no frontend

---

## 🧠 Resumo

* fluxo padronizado
* reduz bugs
* facilita manutenção
