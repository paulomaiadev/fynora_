# Fynora — Advanced Security Standards

## Autenticação

* JWT com expiração curta (15min)
* Refresh token seguro (armazenado no backend ou httpOnly cookie)
* Logout invalida refresh token

---

## Autorização (RBAC)

Papéis:

* owner (acesso total)
* future: staff

Regras:

* usuário só acessa dados da própria empresa
* validar company_id em TODAS requisições

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

---

## Logs de segurança

* tentativas de login falhas
* acessos suspeitos
