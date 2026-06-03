# Fynora — Business Rules

## Objetivo

Definir regras de negócio fundamentais do sistema.

---

## Receita (Revenue)

* amount deve ser > 0
* date obrigatória
* customer_id opcional
* valores em BRL
* precisão: 2 casas decimais

---

## Despesa (Expense)

* amount > 0
* categoria obrigatória
* date obrigatória

---

## Lucro

lucro = soma(receitas) - soma(despesas)

---

## Faturamento

faturamento = soma(receitas)

---

## Projetos

### Status válidos

* pending
* in_progress
* completed

---

### Transições permitidas

pending → in_progress
in_progress → completed

---

### Transições proibidas

completed → pending

---

## Insights

* baseados em dados reais
* nunca aleatórios
* devem conter:

  * tipo
  * mensagem
  * contexto

---

## Multi-tenant

* todo registro pertence a uma empresa
* acesso sempre filtrado por company_id
