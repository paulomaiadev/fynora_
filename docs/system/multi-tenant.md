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

---

## Exceções e Casos Especiais

### Acesso Administrativo

Não existe acesso cross-tenant no MVP.

Qualquer necessidade futura de suporte técnico ou administração de dados
de múltiplas empresas DEVE seguir a especificação em
`docs/engineering/security-advanced.md` (seção SuperAdmin / Suporte Técnico).

**Regra:** a ausência desta especificação não autoriza implementações ad-hoc.
