# 🔌 Contratos de API - Fynora Core Finance

Todas as rotas abaixo requerem autenticação. O Frontend deve enviar o Token JWT no header da requisição:
`Authorization: Bearer <seu_token_aqui>`

---

### 1. Criar Transação (O "Swipe" do Empreendedor)
* **Rota:** `POST /api/v1/transaction`
* **Descrição:** Lança uma nova entrada ou saída no Ledger.

**Payload de Envio (Request Body):**
```json
{
  "description": "Compra de insumos",
  "amount": 250.75,
  "type": "OUTFLOW", // Pode ser "INFLOW" (Entrada) ou "OUTFLOW" (Saída)
  "date": "2026-07-09T14:30:00Z",
  "isBusiness": true, // false se for gasto pessoal na conta PJ
  "category": "Fornecedores" // Opcional
}