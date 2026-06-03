# Fynora — API Contract

## Base URL

/api/v1

---

## Padrão de resposta

{
"success": true,
"data": {},
"error": null
}

---

## Erro padrão

{
"success": false,
"error": {
"code": "ERROR_CODE",
"message": "Mensagem"
}
}

---

## Auth

### POST /auth/login

Request:

{
"email": "[user@email.com](mailto:user@email.com)",
"password": "123456"
}

Response:

{
"success": true,
"data": {
"access_token": "jwt"
}
}

---

## Revenues

### POST /revenues

Request:

{
"amount": 100.50,
"description": "Venda",
"date": "2026-01-01"
}

---

### GET /revenues

Response:

{
"success": true,
"data": []
}

---

## Expenses

### POST /expenses

Request:

{
"amount": 50,
"category": "Marketing",
"date": "2026-01-01"
}

---

## Customers

### POST /customers

{
"name": "Cliente"
}

---

## Projects

### POST /projects

{
"name": "Projeto",
"status": "pending",
"value": 1000
}
