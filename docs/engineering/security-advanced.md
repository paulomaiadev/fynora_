# Fynora — Advanced Security Standards

## Autenticação

* JWT com expiração curta (15min)
* Refresh token seguro (armazenado no backend ou httpOnly cookie)
* Logout invalida refresh token

---

## Autorização (RBAC)

Papéis definidos:

* `owner` — acesso total aos dados da própria empresa
* `future: staff` — acesso restrito dentro da própria empresa

### SuperAdmin / Suporte Técnico

**Status: NÃO IMPLEMENTADO no MVP. Acesso cross-tenant é proibido por padrão.**

Quando implementado, deverá seguir obrigatoriamente estas regras:

1. O papel `superadmin` NUNCA é codificado no JWT do usuário comum.
   Deve existir em um sistema de autenticação separado ou em um token
   de vida curta emitido por um endpoint administrativo protegido.

2. Todo acesso cross-tenant por suporte DEVE:
   - ser autorizado explicitamente (ex: solicitação do próprio cliente)
   - ser registrado em log de auditoria com: `userId`, `targetCompanyId`,
     `action`, `timestamp`
   - ter duração limitada (token de sessão de suporte com TTL curto)

3. Rotas administrativas DEVEM estar sob prefixo separado (ex: `/api/admin/v1`)
   e protegidas por guard distinto do `JwtAuthGuard` padrão.

4. O isolamento lógico não é quebrado — o suporte acessa dados
   impersonando o contexto da empresa-alvo, nunca bypassando o filtro
   `company_id`.

---

## Proteções

### Rate Limiting

* limitar requisições por IP
* proteger login contra brute force

---

### Headers de segurança

* helmet (NestJS)
* Content-Security-Policy
* X-Frame-Options
* X-XSS-Protection

---

### XSS / CSRF

* sanitizar inputs
* usar httpOnly cookies (quando aplicável)

---

### SQL Injection

* usar Prisma (ORM)
* nunca usar queries raw sem validação

---

## Auditoria

Registrar:

* login
* criação de dados
* alterações críticas
* **acesso cross-tenant por suporte (quando implementado)**

---

## Logs de segurança

* tentativas de login falhas
* acessos suspeitos
