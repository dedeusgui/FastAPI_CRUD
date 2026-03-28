# FastAPI CRUD

Projeto de portfolio com uma API REST construída em FastAPI. A aplicação cobre autenticação por sessão, gerenciamento de tarefas e relacionamento de amizade entre usuários.

## Stack

- FastAPI
- SQLAlchemy
- PostgreSQL
- Pytest

## Domínios

- `user`: cadastro, login e identificação do usuário autenticado
- `tasks`: criação e gestão de tarefas vinculadas ao usuário
- `friends`: solicitações de amizade e consulta de relacionamentos
- `auth`: sessão e autenticação via cookie `access_token`

## Documentação

- [Arquitetura](docs/ARCHITECTURE.MD)
- [Regras de Negócio](docs/BUSINESS_RULES.MD)
- [Regras da Codebase](docs/CODEBASE_RULES.MD)

## Observação

O projeto agora possui um frontend em `frontend/`, pensado como vitrine funcional do produto. A documentação em `docs/` continua mais focada no back-end e nas regras já consolidadas da API.
