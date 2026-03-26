# Fynora — AGENTS.md

## Objective

Guide AI agents to generate consistent, secure and scalable code.

---

## Stack

* Next.js
* NestJS
* PostgreSQL
* Prisma

---

## Architecture

* Clean Architecture
* Modular Monolith

---

## Core Rules

1. ALWAYS use `company_id`
2. NEVER access data without tenant validation
3. FOLLOW module structure strictly
4. DO NOT create new patterns
5. DO NOT skip validation

---

## Module Structure (MANDATORY)

Each module must contain:

* controller
* service
* repository
* dto
* entity

---

## Backend Rules

* No business logic in controllers
* Services contain all logic
* Repositories handle DB only

---

## Database Rules

* Use Prisma only
* Follow schema strictly
* Do not modify schema without instruction

---

## Security Rules

* JWT required
* bcrypt for passwords
* Validate all inputs
* Never trust frontend

---

## Multi-tenant Rules

* Every query MUST filter by `company_id`
* No cross-company access allowed

---

## Code Quality

* Strong typing (TypeScript)
* Small functions
* Avoid duplication
* Clear naming

---

## Objective

Generate production-ready code with consistency and scalability.
