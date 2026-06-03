# 🔐 Auth Flow — Fynora

## Objetivo

Definir o fluxo completo de autenticação e autorização do sistema, garantindo segurança, isolamento multi-tenant e consistência arquitetural.

---

## 🧠 Princípios

- Autenticação baseada em **JWT**
- Autorização baseada em **contexto do usuário**
- Isolamento multi-tenant obrigatório
- Nunca confiar em dados vindos do frontend

---

## 🔑 Estrutura do JWT

O token deve conter:

```json
{
  "userId": "uuid",
  "companyId": "uuid"
}
