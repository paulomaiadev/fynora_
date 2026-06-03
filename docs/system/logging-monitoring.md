# Fynora — Logging & Monitoring

## Objetivo

Rastrear erros e comportamento do sistema.

---

## Logs

Tipos:

* info
* warn
* error

---

## O que logar

* erros de API
* autenticação
* ações críticas

---

## Estrutura

{
"level": "error",
"message": "Erro ao criar receita",
"context": {}
}

---

## Monitoramento (futuro)

* Sentry
* logs centralizados

---

## Regras

* nunca logar senha
* logs devem ser claros
