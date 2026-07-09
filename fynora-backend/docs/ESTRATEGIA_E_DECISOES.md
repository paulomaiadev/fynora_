# 🧭 Fynora: Estratégia, Produto e Arquitetura

Este documento registra as principais decisões de negócios e arquitetura de software da Fynora, garantindo que qualquer desenvolvedor, IA ou investidor entenda o *porquê* o sistema foi construído dessa forma.

## 1. Estratégia de Negócios e Go-to-Market (GTM)
* **Público-Alvo Inicial:** Microempreendedores e freelancers (MEIs, Autônomos, Simples Nacional).
* **Validação do MVP (Alpha Testers):** O produto será lançado inicialmente para um grupo fechado e controlado de 30 empreendedores (estratégia *concierge*).
* **A Proposta de Valor Core:** Resolver a "Confusão Patrimonial" (mistura de contas PF e PJ) que destrói pequenos negócios, dando visibilidade em tempo real do caixa.
* **Redução de Custo de Validação (Burn Rate):** Decidimos NÃO integrar APIs caras de Open Finance (Pluggy, Belvo) no Dia 1. A validação será feita via Lançamento Manual Simples e, em seguida, Upload de CSV/OFX.

## 2. Visão de Produto (UX/UI)
* **O "Tinder das Finanças":** O fluxo de entrada de dados precisa ter atrito quase zero. O usuário deve conseguir classificar rapidamente se uma transação é pessoal ou do negócio.
* **Dashboard Pragmático:** Foco em métricas de sobrevivência, não em contabilidade complexa.
  1. Saldo Geral.
  2. Lucro Operacional Real.
  3. **Índice de Confusão Patrimonial (ICP)** - A principal métrica viral do produto.

## 3. Decisões Arquiteturais de Engenharia (Backend)

### 3.1. Modelo "Single Ledger" (Livro-Caixa Unificado)
* **Decisão:** Unificamos as antigas tabelas `Revenue` (Receitas) e `Expense` (Despesas) em uma única tabela `Transaction`.
* **Motivo:** Otimizar buscas, permitir paginação simples do extrato, facilitar o cálculo de saldo agrupado no banco de dados e permitir a futura adição de "Estornos" e "Transferências" sem quebrar a estrutura.

### 3.2. Rigor Matemático (O Padrão CFO)
* **Decisão:** Proibido o uso de `Float` ou `Number` nativo para armazenar valores financeiros no banco de dados.
* **Motivo:** Evitar erros de arredondamento em dízimas periódicas nativos do JavaScript. Todos os valores monetários usam o tipo `Decimal(12, 2)` no PostgreSQL e a biblioteca `decimal.js` nas agregações do serviço.

### 3.3. Segurança e Isolamento (Tenant-Isolation & Anti-IDOR)
* **Decisão:** O ID da Empresa (`company_id`) NUNCA é passado pelo usuário via body (JSON) ou parâmetros de URL nas rotas financeiras.
* **Motivo:** Prevenir vazamento de dados (IDOR). O backend intercepta o Token JWT via `@UseGuards(JwtAuthGuard)` e injeta o ID da empresa de forma invisível nas consultas ao banco através do custom decorator `@CurrentCompanyId()`. O usuário só vê o que é da sua própria empresa.

### 3.4. Imutabilidade do Ledger (Anti-Fraude)
* **Decisão:** Não existe rota de `UPDATE` (edição) para transações financeiras. 
* **Motivo:** Em sistemas contábeis profissionais, não se edita um lançamento. Se houver erro, a transação deve ser deletada e uma nova criada (ou feito um lançamento de estorno no futuro). Isso preserva a integridade do histórico do caixa.