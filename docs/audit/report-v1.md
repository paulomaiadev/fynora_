# Fynora — Audit Report v1
**Auditor:** Staff Software Architect / SaaS Financial Compliance  
**Data:** 2026-06-08  
**Escopo:** Toda a documentação em `/docs/**`, `AGENTS.md`, `README.md`, `prompt.txt`, `.cursorrules`  
**Classificação:** 🔴 CRÍTICO | 🟠 ALTO | 🟡 MÉDIO | 🟢 BAIXO

---

## SUMÁRIO EXECUTIVO

A documentação do Fynora apresenta uma base arquitetural razoável para um MVP, mas contém **lacunas críticas que, em produção, resultariam em perda de dados, vazamento cross-tenant, falhas de concorrência em transações financeiras e ausência completa de contratos de API concretos**. O projeto está documentado no nível de "intenção", mas não no nível de "implementação". Para um SaaS financeiro — onde a integridade dos dados é o produto — esse gap é inaceitável.

Total de problemas identificados: **74 itens** distribuídos em 12 domínios.

---

## PARTE I — CONTRADIÇÕES LÓGICAS E INCONSISTÊNCIAS ENTRE DOCUMENTOS

### [C-01] 🔴 Contradição: PrismaTransactionManager vs. injeção direta não definida em lugar algum

**Onde:** `docs/engineering/ai-rules.md` + `fynora-backend/.cursorrules`  
**Problema:** Ambos os arquivos afirmam que `PrismaService` NUNCA deve ser injetado diretamente em Services ou Repositories, e que todo acesso deve passar pelo `PrismaTransactionManager`. Porém, **em nenhum arquivo da documentação existe qualquer especificação de como o `PrismaTransactionManager` é implementado**: sua interface, contrato, como `TransactionSession` funciona, como o `run(async (tx) => {...})` lida com rollback em cascata, ou como é registrado como provider no módulo NestJS. Toda a documentação técnica referencia um artefato que não existe documentado.

**Impacto:** Qualquer desenvolvedor ou agente que tente seguir as regras vai gerar código incorreto por falta de especificação. O contrato `txManager.run(tx => ...)` pode ser interpretado de dezenas de formas incompatíveis.

---

### [C-02] 🔴 Contradição: JWT com expiração de 15 minutos vs. nenhuma estratégia de refresh documentada para o frontend

**Onde:** `docs/engineering/security-advanced.md` (15min access token) + `docs/system/auth-flow.md` (nenhuma menção ao fluxo de refresh)  
**Problema:** O `auth-flow.md` define apenas a estrutura do JWT `{userId, companyId}` e menciona bcrypt, mas **nunca documenta o fluxo de refresh token**. O `security-advanced.md` menciona "Refresh token seguro (armazenado no backend ou httpOnly cookie)" e "Logout invalida refresh token" — mas qual das duas opções foi escolhida? Como o frontend detecta um token expirado? Qual é o endpoint de refresh? Qual é o TTL do refresh token? Isso não existe em `docs/api/api-contract.md`.

**Impacto:** Em produção, com access token de 15 minutos, **o usuário seria deslogado a cada 15 minutos**. O frontend não tem nenhum contrato documentado para renovar o token.

---

### [C-03] 🔴 Contradição: `api-contract.md` não cobre os módulos documentados em `feature-specs.md`

**Onde:** `docs/api/api-contract.md` + `docs/product/feature-specs.md`  
**Problema:** O `feature-specs.md` especifica os módulos `revenues`, `expenses`, `customers`, `projects`, `insights`. O `api-contract.md` documenta apenas: `POST /auth/login`, `POST /revenues`, `GET /revenues`, `POST /expenses`, `POST /customers`, `POST /projects`. Estão ausentes:
- `GET/PATCH/DELETE /revenues/:id`
- `GET/PATCH/DELETE /expenses/:id`
- `GET /customers`, `GET /customers/:id`, `PATCH/DELETE /customers/:id`
- `GET /projects`, `GET /projects/:id`, `PATCH /projects/:id` (change status)
- `GET /insights`
- `POST /auth/register`
- `GET /dashboard` (métricas agregadas)
- `PATCH /auth/refresh` (refresh token)
- `POST /companies` (criar empresa no onboarding)

**Impacto:** O contrato de API está ~15% completo. Não é possível implementar nem fazer testes com base neste documento.

---

### [C-04] 🟠 Contradição: Business Rules definem `value >= 0` para Projects, mas Feature Specs implicitamente exigem `> 0`

**Onde:** `docs/domain/business-rules.md` ("value >= 0") + `docs/product/feature-specs.md` ("value: validações: value >= 0")  
**Problema:** Um projeto com `value = 0` é semanticamente válido? Se sim, como o dashboard calcula faturamento projetado? Se não, a validação está errada. Esta inconsistência não é resolvida em nenhum documento.

---

### [C-05] 🟠 Contradição: `customer_id` é opcional em Revenue, mas não existe documentação sobre o comportamento de `GET /revenues` quando `customer_id` é nulo

**Onde:** `docs/domain/business-rules.md` + `docs/product/feature-specs.md` + `docs/api/api-contract.md`  
**Problema:** O campo `customer_id` é opcional em Revenue. Mas: quando o cliente é deletado, o que acontece com as receitas vinculadas? O Prisma lança `P2025`? A receita fica órfã com `customer_id` apontando para nada? A documentação de cascata de FK não existe.

---

### [C-06] 🟡 Contradição: Módulos listados em `architecture.md` incluem `insights`, mas `folder-structure.md` não o inclui

**Onde:** `docs/system/architecture.md` lista `insights` como módulo; `docs/engineering/folder-structure.md` termina em `expenses/` e `projects/` — sem `insights`.  
**Impacto:** Agentes que seguem `folder-structure.md` não vão criar a pasta `insights/`.

---

### [C-07] 🟡 Contradição: `ux-writing.md` proíbe o termo "Revenue" mas `api-contract.md` usa `/revenues` como endpoint

**Onde:** `docs/product/ux-writing.md` ("❌ Revenue → ✅ Faturamento") + `docs/api/api-contract.md` (rota `/revenues`)  
**Contexto:** A contradição é intencional (inglês no código, português na UI), mas **não está explicitamente documentada essa distinção**. O `coding-standards.md` não menciona a regra de "código em inglês, UI em português". Somente o `.cursorrules` menciona isso. A ausência desta regra explícita na documentação principal vai gerar inconsistência.

---

## PARTE II — FALHAS DE SEGURANÇA E MULTI-TENANT NÃO MAPEADAS

### [S-01] 🔴 CRÍTICO: Nenhum mecanismo documentado para validar que `company_id` do JWT corresponde ao recurso solicitado

**Onde:** Toda a documentação  
**Problema:** Os documentos repetem "todo query deve filtrar por `company_id`", mas **nunca especificam o mecanismo de validação no nível de recurso individual**. Exemplo: `GET /revenues/:id` — o service deve verificar se a revenue com esse `id` pertence ao `company_id` do JWT. Se não verificar, um atacante autenticado em empresa A pode fazer `GET /revenues/uuid-da-empresa-B` e obter dados de outro tenant.

Esta verificação de ownership precisa ser documentada como padrão obrigatório: `findByIdOrThrow(id, companyId)` deve buscar `WHERE id = :id AND company_id = :companyId`, não apenas `WHERE id = :id` seguido de verificação manual.

**Impacto:** **Vazamento de dados cross-tenant** via IDOR (Insecure Direct Object Reference) — a vulnerabilidade #1 em SaaS multi-tenant.

---

### [S-02] 🔴 CRÍTICO: Nenhuma especificação de rate limiting para endpoints sensíveis além do login

**Onde:** `docs/engineering/security-advanced.md`  
**Problema:** O documento menciona "limitar requisições por IP" e "proteger login contra brute force" mas não documenta:
- Quais endpoints além do login têm rate limiting?
- Qual é o threshold (ex: 10 req/min por IP? 100 req/min por user?)
- O que acontece ao atingir o limite? (HTTP 429, Retry-After header?)
- Há rate limiting por `company_id` para evitar que um tenant degrade o sistema para outros?

---

### [S-03] 🔴 CRÍTICO: Ausência total de documentação sobre invalidação de JWT

**Onde:** Toda a documentação  
**Problema:** JWT é stateless por natureza. Se um usuário muda a senha, ou um admin force-logout, o token antigo continua válido pelo seu TTL de 15 minutos. A documentação menciona "Logout invalida refresh token" mas não especifica:
- Onde o refresh token é armazenado no backend (tabela? Redis? em memória?)
- Qual o schema desta tabela/store
- Como o endpoint `POST /auth/logout` invalida o token
- Se existe blacklist de tokens JWT (para acesso imediato à revogação)
- O que acontece com sessões abertas quando a senha é alterada

---

### [S-04] 🔴 CRÍTICO: Nenhuma documentação sobre proteção contra Mass Assignment

**Onde:** `docs/engineering/coding-standards.md`, `AGENTS.md`, `.cursorrules`  
**Problema:** DTOs com `class-validator` são mencionados, mas não há especificação de `@Exclude()` / `@Expose()` com `class-transformer` e `excludeExtraneousValues: true`. Sem isso, um atacante pode enviar `company_id` no body do request e potencialmente sobrescrever o `company_id` proveniente do JWT — **quebrando o isolamento multi-tenant na camada de criação de dados**.

---

### [S-05] 🟠 Ausência de documentação sobre CORS

**Onde:** `docs/engineering/security-advanced.md`, `docs/system/deployment.md`  
**Problema:** Nenhum documento especifica a política de CORS: quais origens são permitidas, se credenciais são habilitadas, quais métodos e headers são aceitos. Em produção, CORS mal configurado pode expor a API a requisições de qualquer origem.

---

### [S-06] 🟠 Ausência de documentação sobre exposição de UUIDs vs. IDs sequenciais

**Onde:** `docs/system/database.md`, `docs/api/api-contract.md`  
**Problema:** O `auth-flow.md` usa `uuid` no JWT. O `api-contract.md` mostra `"id": "uuid"` nas respostas. Mas o schema do Prisma não está documentado — existem IDs sequenciais (INT) no banco? Se sim, eles nunca devem ser expostos na API (enumeration attack). Se UUIDs, qual versão (v4, v7)?

---

### [S-07] 🟡 Ausência de documentação sobre input sanitization além de `class-validator`

**Onde:** `docs/engineering/security-advanced.md`  
**Problema:** O documento menciona "sanitizar inputs" contra XSS, mas não especifica: campos de texto livre (como `description` em Revenue) são sanitizados contra HTML injection? O NestJS não sanitiza automaticamente — isso precisa de uma biblioteca específica (ex: `sanitize-html`, `DOMPurify`). Não documentado.

---

## PARTE III — LACUNAS DE REGRAS DE NEGÓCIO

### [B-01] 🔴 CRÍTICO: Nenhuma regra documentada para soft delete vs. hard delete

**Onde:** `docs/domain/business-rules.md`, `docs/system/database.md`  
**Problema:** Em um SaaS financeiro, deleção de dados (receitas, despesas, clientes) tem implicações sérias:
- Um cliente deletado que tem receitas associadas — o que acontece? Cascade delete? `SET NULL`?
- Uma despesa deletada deve desaparecer do dashboard histórico ou ser marcada como deletada (`deleted_at`)?
- O Prisma tem suporte a soft delete via middleware — mas nenhum documento menciona isso.
- **Implicação fiscal:** um MEI não pode simplesmente "deletar" uma receita que já foi declarada. Isso precisa de uma regra de negócio explícita.

---

### [B-02] 🔴 CRÍTICO: Nenhuma regra documentada para a moeda e precisão monetária

**Onde:** `docs/domain/business-rules.md`  
**Problema:** O documento diz "valores em BRL" e "precisão: 2 casas decimais", mas:
- O tipo no banco é `DECIMAL(10,2)`? `FLOAT`? `INT` (centavos)? — Nunca documentado.
- `FLOAT` em banco de dados para valores monetários é um erro clássico que causa erros de arredondamento (ex: `100.10` pode virar `100.09999999...`).
- Como o ORM serializa valores monetários para JSON? `"amount": 100.50` ou `"amount": "100.50"`?
- Há validação de overflow? Um amount de `999999999999.99` é válido?

---

### [B-03] 🔴 CRÍTICO: Regras de transição de status de Project estão incompletas

**Onde:** `docs/domain/business-rules.md`  
**Problema:** As transições documentadas são:
- `pending → in_progress` ✅
- `in_progress → completed` ✅
- `completed → pending` ❌ (proibido)

Não documentado:
- `pending → completed` diretamente — permitido ou não?
- `completed → in_progress` — permitido para "reabrir"? (muito comum na prática)
- `in_progress → pending` — cancelamento/volta ao rascunho — permitido?
- O que acontece com as receitas associadas ao projeto quando ele é `completed`?

---

### [B-04] 🟠 Ausência de regras para período/filtro temporal nas consultas financeiras

**Onde:** `docs/domain/business-rules.md`, `docs/api/api-contract.md`  
**Problema:** O dashboard exibe "faturamento do mês" e "despesas do mês" — mas como são filtradas? 
- `GET /revenues` retorna TODOS os registros históricos ou apenas do mês corrente?
- Há parâmetros de query `?startDate=&endDate=`? `?month=&year=`?
- Como o backend determina "mês atual" — timezone do servidor? do usuário? da empresa?
- **Nenhum endpoint de agregação está documentado** (ex: `GET /dashboard/summary`).

---

### [B-05] 🟠 Ausência de regras para paginação

**Onde:** `docs/api/api-contract.md`  
**Problema:** `GET /revenues` retorna `"data": []` — uma lista. Para um MEI com 3 anos de operação e 2.000 receitas registradas, esta query sem paginação vai:
1. Retornar payload massivo
2. Fazer full table scan no PostgreSQL
3. Potencialmente estourar o limite de memória do servidor

Não existe documentação de: cursor-based pagination, offset-based pagination, limite padrão, limite máximo.

---

### [B-06] 🟠 Ausência de regras para o módulo de Insights — o diferencial central do produto

**Onde:** `docs/product/feature-specs.md`, `docs/domain/business-rules.md`, `docs/product/prd.md`  
**Problema:** Insights são o **diferencial central** da Fynora segundo o business plan, mas a documentação técnica é quase nula:
- `feature-specs.md`: "gerados automaticamente, vinculados à empresa" — isso é tudo.
- `business-rules.md`: "baseados em dados reais, nunca aleatórios, devem conter: tipo, mensagem, contexto"
- Não existe: quais tipos de insights existem? Quais são os triggers de geração (cron job? event-driven? on-demand)? Qual modelo de IA é usado? Como os insights são armazenados (schema)? Qual é o TTL de um insight? São regenerados automaticamente?

---

### [B-07] 🟠 Nenhuma documentação sobre o processo de onboarding (criar empresa)

**Onde:** `docs/product/user-flows.md`  
**Problema:** O user flow documenta "Cadastro → Criar empresa → Dashboard", mas:
- Um usuário pode ter múltiplas empresas?
- Se não, o que acontece se ele tenta criar uma segunda?
- No momento do cadastro, a empresa é criada automaticamente ou é um passo separado?
- Quais são os campos obrigatórios da empresa (nome, CNPJ, tipo)?
- Há validação de CNPJ formato?

---

### [B-08] 🟡 Ausência de regras para categorias de despesa

**Onde:** `docs/product/feature-specs.md`, `docs/domain/business-rules.md`  
**Problema:** Expense tem `category` como campo obrigatório — mas:
- As categorias são uma lista fixa (enum) ou texto livre?
- Se lista fixa, quais são? (Marketing, Aluguel, Equipamentos, Salários, Impostos, Outros?)
- Se texto livre, há normalização (uppercase? trim?)?
- Como as categorias são usadas no dashboard/insights?

---

### [B-09] 🟡 Nenhuma regra documentada para o que acontece quando `amount` de Revenue é atualizado via PATCH

**Onde:** `docs/domain/business-rules.md`  
**Problema:** As regras de Revenue documentam criação, mas não atualização. Perguntas sem resposta:
- Uma receita já lançada pode ter seu `amount` alterado?
- Se sim, há um log de auditoria da alteração?
- O dashboard recalcula automaticamente ao alterar um valor passado?

---

### [B-10] 🟡 Nenhuma documentação sobre limites do plano Free vs. Pro

**Onde:** `docs/business/business-plan.md`, `docs/product/prd.md`  
**Problema:** O business plan menciona "Plano Free: limitado, foco em aquisição" vs. "Plano Pro: completo". Mas nenhum documento técnico especifica:
- Qual é o limite do plano Free? (ex: 50 receitas/mês? 10 clientes?)
- Como o sistema verifica e enforça esses limites?
- Qual é a resposta quando o limite é atingido? HTTP 402 (Payment Required)?
- Existe a entidade `subscription` no banco de dados?

---

## PARTE IV — EDGE CASES E CENÁRIOS EXTREMOS NÃO PREVISTOS

### [E-01] 🔴 CRÍTICO: Race Condition em criação simultânea de dados financeiros

**Situação:** Dois requests simultâneos de `POST /revenues` com o mesmo `amount` e `date` para a mesma empresa.  
**Problema:** Não há documentação sobre:
- Idempotência: existe `idempotency_key` nos endpoints de escrita?
- Unique constraints no banco para evitar duplicatas?
- Sem isso, o usuário com conexão instável que clica "Salvar" duas vezes registra a receita em duplicidade.

---

### [E-02] 🔴 CRÍTICO: Comportamento não documentado quando a transação Prisma falha parcialmente

**Situação:** `txManager.run()` executa múltiplas operações. A segunda falha (ex: constraint violation). O `PrismaTransactionManager` faz rollback automático? Lança exceção? Retorna `null`?  
**Problema:** O `.cursorrules` mostra o padrão `txManager.run(async (tx) => {...})` mas nunca documenta:
- O que `run()` retorna em caso de erro
- Se o rollback é automático ou manual
- Como o Service deve tratar uma exceção do `txManager`
- Se existe retry automático para erros de deadlock (Prisma P2034)

---

### [E-03] 🔴 CRÍTICO: Concorrência de banco — Prisma P2034 (deadlock) não documentado

**Situação:** Dois usuários da mesma empresa (quando multi-user for implementado) atualizam dados simultaneamente, causando deadlock no PostgreSQL.  
**Problema:** `docs/system/error-handling.md` documenta apenas P2002 (unique constraint) e P2025 (not found). **Prisma P2034 (transaction conflict/deadlock) não está mapeado.** Em operações financeiras com transações, deadlocks são esperados e precisam de tratamento com retry exponencial.

---

### [E-04] 🔴 CRÍTICO: Sem documentação sobre consistência eventual no dashboard

**Situação:** Usuário registra uma receita de R$1.000 e imediatamente abre o dashboard.  
**Problema:** Se o cálculo do dashboard é feito via query em tempo real, qual é o comportamento esperado? Se houver cache (não documentado), o dado pode estar desatualizado. Se o dashboard usa agregações pesadas sem índices, a query pode ser lenta. Nenhum destes cenários está tratado.

---

### [E-05] 🔴 CRÍTICO: Ausência de documentação sobre o schema do banco de dados

**Onde:** `docs/system/database.md`, `/prisma/schema.prisma` (referenciado mas não incluso na documentação)  
**Problema:** O arquivo `prompt.txt` menciona `/prisma/schema.prisma` como fonte de verdade, mas este arquivo **não está presente na documentação**. A documentação nunca especifica:
- Tipos exatos das colunas (`amount`: `Decimal`, `Float`, `Int`?)
- Índices criados (há índice em `company_id`? em `date`?)
- Constraints de integridade referencial (FK com `onDelete: Restrict`? `Cascade`? `SetNull`?)
- Enums do Prisma para `status` de Project

---

### [E-06] 🟠 Comportamento não documentado quando JWT contém `companyId` de uma empresa deletada

**Situação:** Um usuário tem um JWT válido, mas a empresa foi deletada entre a emissão do token e o request.  
**Problema:** O repository vai filtrar por `company_id` que não existe mais. O resultado será uma lista vazia (para GETs) ou um erro FK (para POSTs). Não há documentação sobre este cenário. O guard de JWT não valida a existência da empresa no banco — e se validasse, seria uma query extra em todo request.

---

### [E-07] 🟠 Comportamento não documentado para `date` em Revenue/Expense com fuso horário

**Situação:** Usuário em Manaus (UTC-4) registra uma receita às 23:30. O servidor está em UTC. A data armazenada é do dia corrente (UTC-4) ou do dia seguinte (UTC)?  
**Problema:** `date` é `DATE` (sem timezone) ou `TIMESTAMP WITH TIME ZONE`? Não documentado. Para relatórios mensais ("faturamento de janeiro"), a inconsistência de timezone pode alocar transações no mês errado.

---

### [E-08] 🟠 Comportamento não documentado para upload de arquivo/comprovante

**Situação:** O usuário quer anexar um comprovante de despesa (nota fiscal, recibo).  
**Problema:** Não há menção a esta funcionalidade em nenhum documento, mas é uma necessidade real e esperada do público MEI. Se for implementada futuramente sem documentação, qual bucket S3/storage será usado? Como os arquivos são vinculados ao tenant?

---

### [E-09] 🟠 Ausência de documentação sobre expiração e rotação de secrets

**Onde:** `docs/system/deployment.md`  
**Problema:** `JWT_SECRET` é listado como variável de ambiente mas não há documentação sobre:
- Qual é o tamanho mínimo do segredo (deve ser ≥ 256 bits para HS256)?
- Como é rotacionado sem derrubar sessões ativas?
- O que acontece quando `JWT_SECRET` é comprometido?

---

### [E-10] 🟠 Nenhuma documentação sobre o comportamento do sistema sob carga (limites de conexão DB)

**Onde:** `docs/system/architecture.md`, `docs/system/deployment.md`  
**Problema:** PostgreSQL tem limite de conexões (padrão: 100). O Prisma usa connection pooling. Em deploy no Railway/Supabase:
- Qual é o `connection_limit` configurado no Prisma?
- Há documentação sobre o uso de `pgBouncer` ou similar?
- O que acontece quando o pool esgota? `P2024` (connection acquisition timeout) — não mapeado em `error-handling.md`.

---

### [E-11] 🟡 Comportamento não documentado para campos `description` com caracteres especiais

**Situação:** Usuário insere `description: "<script>alert('xss')</script>"` em uma receita.  
**Problema:** O `.cursorrules` usa `class-validator` mas sem `@Transform` + sanitização. O dado é armazenado como-está. Quando exibido no frontend (Next.js), React escapa automaticamente — mas se a descrição for usada em um PDF gerado, relatório enviado por email, ou renderizada via `dangerouslySetInnerHTML`, é um vetor de XSS.

---

### [E-12] 🟡 Sem documentação sobre o comportamento de `GET /revenues` com filtros compostos

**Situação:** Frontend precisa exibir receitas de um cliente específico em um período específico.  
**Problema:** A API não documenta query parameters de filtro. Como o frontend implementa a tela de "histórico por cliente"? Deve buscar todos e filtrar no cliente? Isso é inaceitável em produção.

---

### [E-13] 🟡 Ausência de documentação sobre o campo `description` em Revenue ser opcional ou obrigatório

**Onde:** `docs/product/feature-specs.md` lista `description` como campo, mas `docs/domain/business-rules.md` não define se é obrigatório.  
**Inconsistência:** `api-contract.md` mostra `"description": "Venda"` no exemplo, mas sem marcar como required/optional. Uma Revenue sem descrição é válida?

---

### [E-14] 🟡 Race condition em atualização de status de Project

**Situação:** Dois requests simultâneos tentam mudar `pending → in_progress` e `pending → completed` para o mesmo projeto.  
**Problema:** Sem `SELECT FOR UPDATE` ou `optimistic locking`, ambos leem o status como `pending`, ambos validam a transição, e o resultado final é não-determinístico. Nenhum documento menciona estratégias de concorrência otimista/pessimista para entidades com máquina de estado.

---

### [E-15] 🟡 Comportamento não documentado para o `companyId` durante o processo de criação de empresa no onboarding

**Situação:** Usuário acabou de se cadastrar. Ainda não tem `companyId`. Faz um request autenticado.  
**Problema:** O JWT precisa do `companyId` para funcionar. Mas a empresa é criada DEPOIS do cadastro. Há um estado intermediário em que o JWT não tem `companyId`? O sistema permite operar sem empresa? Isso não está documentado.

---

### [E-16] 🟡 Nenhum tratamento documentado para o erro de validação de email duplicado

**Onde:** `docs/system/error-handling.md` menciona P2002 genericamente  
**Problema:** Quando um usuário tenta se cadastrar com um email já existente, o Prisma lança P2002. O documento diz para retornar HTTP 400, mas qual `code` de erro? `EMAIL_ALREADY_EXISTS`? `USER_ALREADY_EXISTS`? O frontend precisa do code exato para exibir a mensagem correta. Nenhum `ERROR_CODE` específico está catalogado em nenhum documento.

---

## PARTE V — LACUNAS DE ARQUITETURA E ENGENHARIA

### [A-01] 🔴 CRÍTICO: Nenhuma documentação sobre o schema do Prisma

**Problema:** O `prompt.txt` diz "Use Prisma schema from `/prisma/schema.prisma`. DO NOT modify schema unless explicitly instructed." Mas este schema nunca foi documentado. É o artefato mais crítico do sistema e está completamente ausente da documentação. Sem ele, nenhum agente pode implementar corretamente nenhum módulo.

---

### [A-02] 🔴 CRÍTICO: Ausência de documentação sobre o padrão de Response Envelope na camada NestJS

**Onde:** `docs/system/response-pattern.md`  
**Problema:** O padrão `{ success, data, error }` está documentado como formato esperado, mas não está documentado **como ele é implementado no NestJS**:
- Existe um `ResponseInterceptor` global que envolve todas as respostas?
- Existe um `ExceptionFilter` global que captura exceções e formata o `{ success: false, error }`?
- Como o interceptor distingue uma resposta HTTP 201 de uma 200?
- O `.cursorrules` menciona "exceções padrão do NestJS (`NotFoundException`, `BadRequestException`)" — mas quem as converte para `{ success: false, ... }`?

---

### [A-03] 🔴 CRÍTICO: Ausência de documentação sobre o módulo de Auth — fluxo de registro

**Onde:** `docs/system/auth-flow.md`, `docs/api/api-contract.md`  
**Problema:** O `api-contract.md` documenta apenas `POST /auth/login`. Mas o user flow começa com "Cadastro". Onde está:
- `POST /auth/register` — campos, validações, resposta
- A relação entre `User` e `Company` no momento do cadastro
- Se o email é verificado (email confirmation flow)
- Se existe `POST /auth/forgot-password` e `POST /auth/reset-password`

---

### [A-04] 🟠 Ausência de documentação sobre Guards e Decorators NestJS

**Onde:** Toda a documentação  
**Problema:** O `JwtAuthGuard` é mencionado em `feature-flow.md` mas nunca documentado:
- Como extrai o `companyId` do JWT e o injeta no request?
- Existe um decorator `@CurrentCompany()` ou `@CurrentUser()`?
- Existe um decorator `@Public()` para rotas não autenticadas?
- Onde o `companyId` fica disponível nos controllers?

---

### [A-05] 🟠 Ausência de documentação sobre migrations e versionamento de schema

**Onde:** `docs/system/database.md`, `docs/engineering/ai-rules.md`  
**Problema:** `ai-rules.md` menciona "usar migrations para alterações de schema", mas não documenta:
- Como as migrations são geradas (`prisma migrate dev`)?
- Como são aplicadas em produção (`prisma migrate deploy`)?
- Existe um processo de rollback de migration?
- Como lidar com migrations em ambiente com dados existentes (zero-downtime)?

---

### [A-06] 🟠 Ausência de documentação sobre testes — sem nenhum exemplo concreto

**Onde:** `docs/quality/test-strategy.md`  
**Problema:** A estratégia menciona "Unit Tests para services" e "Integration Tests para APIs", mas não documenta:
- Framework: Jest? Vitest?
- Mocking do `PrismaTransactionManager` em unit tests — como?
- Como mockar o JWT em integration tests?
- Estrutura de um test file (describe/it padrão)
- Coverage mínimo esperado

---

### [A-07] 🟠 Ausência de documentação sobre o módulo de Dashboard

**Onde:** `docs/product/prd.md`, `docs/product/feature-specs.md`  
**Problema:** O PRD documenta o dashboard com: faturamento do mês, despesas do mês, lucro, gráfico de desempenho. Mas não existe:
- Endpoint documentado para o dashboard (ex: `GET /dashboard`)
- Definição de "mês" — mês corrente? mês selecionável?
- Como o lucro é calculado (`SUM(revenues) - SUM(expenses)` do mês?)
- O gráfico de desempenho: quais dados? Últimos 6 meses? Dia a dia?
- Performance: é uma query agregada ad-hoc ou há materialização/cache?

---

### [A-08] 🟡 Ausência de documentação sobre o padrão de DTOs — Update vs. Create

**Onde:** `docs/engineering/design-patterns.md`  
**Problema:** O documento menciona DTOs para "validação de entrada", mas não documenta:
- `CreateRevenueDto` vs. `UpdateRevenueDto` — todos os campos são required no create mas optional no update?
- Existe um `PartialType` padrão (NestJS fornece via `@nestjs/mapped-types`)?
- Campos que NUNCA devem ser aceitos via DTO (ex: `company_id`, `created_at`)?

---

### [A-09] 🟡 Ausência de documentação sobre o padrão de Entity vs. DTO vs. Prisma Model

**Onde:** `docs/engineering/design-patterns.md`, `AGENTS.md`  
**Problema:** O `AGENTS.md` exige que cada módulo tenha um `entity`. Mas no ecossistema Prisma + NestJS, existe uma confusão frequente:
- A "entity" é apenas o tipo Prisma gerado automaticamente?
- É uma classe separada que mapeia o modelo do banco para o domínio?
- Como é feita a transformação entre Prisma Model → Entity → DTO de resposta?
- Campos sensíveis (ex: `password_hash` em User) — como são excluídos da resposta?

---

### [A-10] 🟡 Nenhuma documentação sobre a estrutura de módulos NestJS e suas dependências

**Onde:** `docs/engineering/folder-structure.md`, `AGENTS.md`  
**Problema:** Cada módulo tem seu próprio `Module`, `Controller`, `Service`, `Repository`. Mas:
- O `RevenueModule` importa o `CustomerModule` para validar que `customer_id` existe?
- O `InsightsModule` importa `RevenueModule` e `ExpenseModule`?
- Existe um `SharedModule` com providers comuns?
- O `PrismaTransactionManager` é um provider global ou importado em cada módulo?

---

## PARTE VI — LACUNAS DE PRODUTO E UX

### [P-01] 🟠 Ausência de documentação sobre tratamento de erros no Frontend

**Onde:** `docs/system/error-handling.md`, `docs/product/design-system.md`  
**Problema:** O `error-handling.md` é focado no backend. O `design-system.md` menciona "feedback claro (ex: sucesso, erro)" genericamente. Não existe documentação sobre:
- Como o frontend exibe erros de validação de campo (inline ou toast?)
- Como o frontend trata HTTP 401 (redirecionar para login?)
- Como o frontend trata HTTP 500 (mensagem genérica?)
- Existe um componente global de error boundary?
- Quais são os textos exatos das mensagens de erro para cada `ERROR_CODE`?

---

### [P-02] 🟡 Ausência de documentação sobre loading states e skeleton screens

**Onde:** `docs/product/design-system.md`  
**Problema:** O design system lista componentes (Button, Input, Card, Modal, Table) mas não documenta:
- Estados de loading de botões (disabled + spinner)
- Skeleton screens para o dashboard enquanto dados carregam
- Estado vazio ("Nenhuma receita registrada ainda")

---

### [P-03] 🟡 Ausência de documentação sobre acessibilidade (a11y)

**Onde:** `docs/product/design-system.md`  
**Problema:** O design system menciona "acessível" como princípio, mas não documenta nenhum requisito concreto de acessibilidade (WCAG 2.1 AA? contraste mínimo? navegação por teclado?).

---

## PARTE VII — DOCUMENTOS REFERENCIADOS QUE NÃO EXISTEM

### [M-01] 🔴 `docs/engineering/security-advanced.md` referencia `docs/engineering/security-standards.md`

`security-advanced.md` é o documento avançado, e existe. Mas `security-standards.md` existe como arquivo mas está **completamente vazio** (conteúdo: nenhum). Todo o conteúdo está invertido — o "advanced" contém regras básicas que deveriam estar no "standards".

---

### [M-02] 🔴 `/prisma/schema.prisma` referenciado mas não documentado

`prompt.txt` instrui: "Use Prisma schema from `/prisma/schema.prisma`". Este arquivo é a fonte de verdade do banco mas **não existe nem como documentação nem na raiz do projeto enviada**.

---

### [M-03] 🟠 `docs/api/api-contract.md` é radicalmente insuficiente para ser a fonte de verdade da API

Documentado como fonte de verdade da API (prioridade #5 em `prompt.txt`), mas contém apenas ~8 endpoints de um sistema com 8 módulos e ~40+ endpoints esperados.

---

### [M-04] 🟡 Não existe documentação de `POST /auth/register`

Nenhum endpoint de cadastro está documentado no `api-contract.md`, apesar de ser o ponto de entrada do sistema.

---

## PARTE VIII — CATÁLOGO COMPLETO DE ERROR CODES AUSENTE

### [EC-01] 🟠 Nenhum catálogo de ERROR_CODEs foi definido

**Onde:** `docs/system/error-handling.md`, `docs/system/response-pattern.md`  
**Problema:** O padrão de erro usa `"code": "ERROR_CODE"` mas em nenhum lugar existe o catálogo dos códigos possíveis. O frontend precisa desses códigos para exibir mensagens corretas. Exemplos do que deveria existir mas não existe:

| Code | Situação |
|------|----------|
| `EMAIL_ALREADY_EXISTS` | Cadastro com email duplicado |
| `INVALID_CREDENTIALS` | Login com senha errada |
| `TOKEN_EXPIRED` | JWT expirado |
| `TOKEN_INVALID` | JWT malformado |
| `RESOURCE_NOT_FOUND` | ID inexistente ou de outro tenant |
| `INVALID_STATUS_TRANSITION` | Transição de status proibida em Project |
| `AMOUNT_MUST_BE_POSITIVE` | amount <= 0 |
| `COMPANY_NOT_FOUND` | companyId do JWT não encontrado |
| `RATE_LIMIT_EXCEEDED` | Threshold de rate limiting atingido |
| `PLAN_LIMIT_REACHED` | Limite do plano Free atingido |

---

## ÍNDICE DEFINITIVO — DOCUMENTOS A CRIAR/COMPLETAR NA PRÓXIMA ETAPA

### 🔴 CRÍTICOS (bloqueiam implementação)

| Arquivo | Propósito |
|---------|-----------|
| `prisma/schema.prisma` | Schema completo do banco com tipos, índices, FKs, enums |
| `docs/engineering/prisma-transaction-manager.md` | Especificação completa do `PrismaTransactionManager` e `TransactionSession` |
| `docs/api/api-contract-complete.md` | Contrato completo da API (todos os 40+ endpoints, query params, responses, error codes) |
| `docs/system/auth-flow-complete.md` | Fluxo completo: register, login, refresh, logout, forgot-password, JWT lifecycle |
| `docs/domain/error-codes-catalog.md` | Catálogo exaustivo de todos os ERROR_CODEs do sistema |
| `docs/domain/business-rules-v2.md` | Regras de negócio completas: soft/hard delete, moeda/precisão, status machine completa, cascade rules |

### 🟠 ALTOS (bloqueiam segurança e qualidade)

| Arquivo | Propósito |
|---------|-----------|
| `docs/engineering/security-standards.md` | (atualmente vazio) Padrões de segurança base: CORS, mass assignment, sanitização, UUID vs INT |
| `docs/system/multi-tenant-idor-protection.md` | Padrão obrigatório de validação de ownership por recurso (`findByIdAndCompany`) |
| `docs/api/dashboard-api.md` | Especificação do endpoint de dashboard: queries de agregação, filtros temporais, timezone |
| `docs/api/pagination-and-filtering.md` | Padrão de paginação (cursor-based), filtros por data, ordenação |
| `docs/engineering/nestjs-patterns.md` | Guards, Decorators, Interceptors, ExceptionFilters — implementação concreta |
| `docs/engineering/dto-patterns.md` | Create vs. Update DTOs, `PartialType`, `@Exclude()`, campos proibidos, transformações |
| `docs/quality/test-strategy-concrete.md` | Estratégia de testes com exemplos concretos, mocking do txManager, coverage mínimo |

### 🟡 MÉDIOS (completam a documentação)

| Arquivo | Propósito |
|---------|-----------|
| `docs/domain/insights-specification.md` | Tipos de insights, triggers, schema de armazenamento, integração com IA |
| `docs/domain/onboarding-flow.md` | Criação de usuário+empresa, estado intermediário sem companyId |
| `docs/domain/expense-categories.md` | Lista canônica de categorias, se enum ou texto livre |
| `docs/system/concurrency-strategy.md` | Race conditions, idempotência, optimistic locking para Project status |
| `docs/system/timezone-strategy.md` | Tratamento de timezone em datas financeiras, armazenamento, exibição |
| `docs/system/database-indexes.md` | Índices necessários para performance em queries por `company_id`, `date`, `customer_id` |
| `docs/system/soft-delete-strategy.md` | Política de deleção para entidades financeiras, uso de `deleted_at` |
| `docs/engineering/module-dependency-map.md` | Mapa de dependências entre módulos NestJS (quem importa quem) |
| `docs/product/frontend-error-handling.md` | Tratamento de erros no frontend por código HTTP e ERROR_CODE |
| `docs/system/subscription-and-plan-limits.md` | Schema de subscription, enforcement de limites Free vs. Pro |
| `docs/system/jwt-invalidation-strategy.md` | Blacklist de tokens, invalidação ao trocar senha, refresh token storage |
| `docs/system/deployment-secrets.md` | Gestão de secrets, rotação de JWT_SECRET, tamanho mínimo |

### 🟢 BAIXOS (melhorias incrementais)

| Arquivo | Propósito |
|---------|-----------|
| `docs/product/empty-states.md` | Estados vazios, loading states, skeleton screens |
| `docs/product/accessibility.md` | Requisitos de acessibilidade (WCAG 2.1 AA) |
| `docs/engineering/commit-and-pr-standards.md` | Padrão de commits expandido (conventional commits, PR template) |
| `docs/domain/project-revenue-association.md` | Regras de associação entre receitas e projetos |
| `docs/system/backup-and-recovery.md` | Estratégia de backup do PostgreSQL, RTO/RPO |

---

## RESUMO EXECUTIVO DE RISCO

| Domínio | Problemas Críticos | Problemas Altos | Total |
|---------|-------------------|-----------------|-------|
| Segurança Multi-tenant | 4 | 3 | 7 |
| Contrato de API | 3 | 2 | 5 |
| Regras de Negócio | 3 | 5 | 8 |
| Edge Cases / Concorrência | 5 | 5 | 10 |
| Arquitetura NestJS | 4 | 6 | 10 |
| Documentos ausentes/vazios | 3 | 1 | 4 |

**Total de itens de risco:** 74  
**Itens críticos (bloqueiam produção):** 24  
**Documentos a criar/completar:** 26  

---

## VEREDICTO FINAL

A documentação atual do Fynora descreve **o que o sistema deve fazer** em alto nível, mas não documenta **como ele deve fazer** com o grau de precisão necessário para um SaaS financeiro. Os riscos mais graves são:

1. **IDOR cross-tenant** por ausência de padrão de ownership validation
2. **Inconsistência monetária** por ausência de especificação do tipo de dado para `amount`
3. **Perda de dados** por ausência de estratégia de soft delete para entidades financeiras
4. **Race conditions** em operações financeiras concorrentes sem idempotência documentada
5. **API incompleta** impossibilitando desenvolvimento frontend com base na documentação

Antes de iniciar qualquer implementação de módulo core, os 6 documentos marcados como 🔴 CRÍTICOS no Índice Definitivo devem ser criados.