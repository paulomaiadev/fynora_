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
```

---

## 📋 Constraints de Campos de Autenticação

### Senha

| Constraint | Valor | Motivo |
|---|---|---|
| `minLength` | 8 caracteres | segurança mínima |
| `maxLength` | **72 caracteres** | limite do algoritmo bcrypt; senhas maiores são truncadas silenciosamente pelo bcrypt, o que pode criar inconsistências de autenticação e vetores de DoS |

**Regra Frontend:** o campo de senha DEVE validar `maxLength(72)` no cliente
antes de submeter o formulário, exibindo a mensagem:
> "A senha deve ter no máximo 72 caracteres."

**Regra Backend:** o DTO de cadastro e de alteração de senha DEVE aplicar
`@MaxLength(72)` via `class-validator` como primeira linha de defesa,
antes de qualquer operação de hash.

### Email

| Constraint | Valor |
|---|---|
| formato | `@IsEmail()` |
| `maxLength` | 255 caracteres |
