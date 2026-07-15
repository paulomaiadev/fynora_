# Fynora — Business Rules c

## Objetivo
Definir regras de negócio fundamentais do sistema, refletindo a arquitetura de livro-razão único (Single Ledger) para a gestão financeira unificada.

---

## Transações (Transactions)
*Substitui as antigas entidades isoladas de Receitas e Despesas.*

* **Tipo (`type`):** Obrigatório. Deve ser `IN` (Receita/Entrada) ou `OUT` (Despesa/Saída).
* **Valor (`amount`):** O valor enviado deve ser sempre absoluto e **> 0**.
* **Moeda:** Valores estritamente em BRL com precisão de 2 casas decimais.
* **Data (`date`):** Obrigatória.
* **Categoria:** Obrigatória caso o tipo seja `OUT` (Despesa). Opcional/Livre caso seja `IN`.
* **Cliente (`customer_id`):** Opcional.

---

## Indicadores (Cálculos Base)

* **Faturamento:** Soma dos valores (`amount`) de todas as transações do tipo `IN`.
* **Despesas Totais:** Soma dos valores (`amount`) de todas as transações do tipo `OUT`.
* **Lucro:** Faturamento - Despesas Totais.

---

## Projetos

### Status válidos
* `pending`
* `in_progress`
* `completed`

### Transições permitidas
* `pending` → `in_progress`
* `in_progress` → `completed`

### Transições proibidas
* `completed` → `pending`

---

## Insights (Gestor Inteligente)
* Baseados em dados reais do fluxo de transações unificado.
* Nunca aleatórios.
* Devem conter obrigatoriamente: tipo, mensagem e contexto.

---

## Multi-tenant
* Todo registro financeiro, de cliente, projeto ou insight pertence a uma empresa.
* O acesso deve ser sempre filtrado pelo `company_id`.