# Fynora — Multi-Tenant Strategy

## Conceito

Cada empresa possui seus próprios dados isolados.

---

## Implementação

Todas as tabelas devem conter:

company_id

---

## Regras

* toda query deve filtrar por company_id
* nenhum dado pode ser acessado sem validação

---

## Objetivo

Garantir segurança e isolamento entre empresas.
