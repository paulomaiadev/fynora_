# 📡 API Response Pattern — Fynora

## Objetivo

Padronizar todas as respostas da API.

---

## 📦 Estrutura Base

{
"success": true,
"data": {},
"error": null
}

---

## ✅ Sucesso

{
"success": true,
"data": {
"id": "uuid",
"amount": 100
},
"error": null
}

---

## ❌ Erro

{
"success": false,
"data": null,
"error": {
"code": "ERROR_CODE",
"message": "Mensagem clara"
}
}

---

## 🧾 Campos

success:

* boolean

data:

* objeto ou array
* null em erro

error:

* objeto ou null

---

## 🔢 HTTP Codes

200 → sucesso
201 → criado
400 → validação
401 → não autorizado
404 → não encontrado
500 → erro interno

---

## 🚫 Não permitido

❌ respostas fora do padrão
❌ erro como string simples
❌ ausência de success

---

## 🧠 Resumo

* padrão único
* integração simples com frontend
* melhora debug e manutenção
