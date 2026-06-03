# Fynora — System Architecture

## Stack

Frontend: Next.js
Backend: NestJS
Database: PostgreSQL
ORM: Prisma
Auth: JWT

---

## Arquitetura

Frontend → API → Service → Repository → Database

---

## Padrões

* Clean Architecture
* Modular Monolith
* API-first

---

## Módulos

* auth
* users
* companies
* customers
* revenues
* expenses
* projects
* insights

---

## Regras

* separação clara de responsabilidades
* sem lógica no controller
* serviços centralizam regras de negócio
