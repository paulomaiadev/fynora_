# ⚠️ Error Handling — Fynora

## Objetivo

Definir um padrão consistente, seguro e previsível para tratamento de erros em todo o sistema.

---

## 🧠 Princípios

- Erros devem ser **padronizados**
- Nunca expor detalhes internos (stack trace, SQL, etc.)
- Separar erro técnico de erro de negócio
- Todas as respostas devem seguir o **API Response Pattern**
- Erros devem ser **previsíveis e tratáveis pelo frontend**

---

## 🧩 Tipos de Erro

### 1. Validation Error

Erro de entrada inválida.

Exemplos:
- `amount <= 0`
- campo obrigatório ausente
- formato inválido

HTTP: `400`

---

### 2. Business Error

Violação de regra de negócio.

Exemplos:
- transição de status inválida
- operação não permitida
- recurso inconsistente

HTTP: `400`

---

### 3. Auth Error

Erro de autenticação/autorização.

Exemplos:
- token inválido
- token ausente
- acesso não permitido

HTTP: `401`

---

### 4. Not Found Error

Recurso não encontrado.

Exemplos:
- ID inexistente
- entidade não pertence ao tenant

HTTP: `404`

---

### 5. System Error

Erro interno inesperado.

Exemplos:
- falha no banco
- exceção não tratada

HTTP: `500`

---

### 6. Database Constraint Error

Violação de restrições do banco de dados capturadas pelo ORM.

Exemplos:
- registro duplicado (Prisma P2002 — unique constraint)
- registro referenciado não encontrado (Prisma P2025)

HTTP: `400` para P2002 (conflito de dados de entrada)
HTTP: `404` para P2025 (recurso não encontrado)

**Regra:** erros do Prisma NUNCA devem ser propagados como texto puro.
Todo erro de ORM deve ser capturado no Service ou em um filtro global
e convertido para o padrão `{ success, data, error }` antes de atingir
o Controller.

---

## 📦 Estrutura Padrão

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem clara e objetiva"
  }
}
```

---

## 🚫 Não permitido

❌ propagar `PrismaClientKnownRequestError` diretamente
❌ retornar texto puro em erros
❌ expor stack trace ou mensagens internas do banco
❌ ausência do envelope `{ success, data, error }`
